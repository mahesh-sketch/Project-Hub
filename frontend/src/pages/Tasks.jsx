import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
  Box,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  DialogContentText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const statusOptions = ["Todo", "In Progress", "Completed"];
const priorityOptions = ["Low", "Medium", "High"];

export default function Tasks() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "Todo",
    priority: "Medium",
    assignedTo: "",
    subTasks: [],
    project: "",
  });
  const [editForm, setEditForm] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === "Admin") {
      axios
        .get("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProjects(res.data))
        .catch(() => setProjects([]));
      axios
        .get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsers(res.data.filter((u) => u.role === "Member")))
        .catch(() => setUsers([]));
    }
    // eslint-disable-next-line
  }, [token, filters, user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTasks(res.data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/tasks", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Task created successfully!",
        severity: "success",
      });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        dueDate: "",
        status: "Todo",
        priority: "Medium",
        assignedTo: "",
        subTasks: [],
        project: "",
      });
      fetchTasks();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create task",
        severity: "error",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // For members, only send status field
      const updateData =
        user?.role === "Admin" ? editForm : { status: editForm.status };

      await axios.put(
        `http://localhost:5000/api/tasks/${selectedTask._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message:
          user?.role === "Admin"
            ? "Task updated successfully!"
            : "Task status updated successfully!",
        severity: "success",
      });
      setEditOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update task",
        severity: "error",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${selectedTask._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Task deleted successfully!",
        severity: "success",
      });
      setDeleteOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete task",
        severity: "error",
      });
    }
  };

  return (
    <Layout>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={900} color="primary">
            Tasks
          </Typography>
          {user?.role === "Admin" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 700 }}
              onClick={handleOpen}
            >
              Create Task
            </Button>
          )}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            select
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Priority"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {priorityOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <Box className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </Box>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary" align="center" mt={4}>
            No tasks found.
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => {
                  const canEditDelete =
                    user?.role === "Admin" ||
                    (user?.role === "Member" &&
                      task.assignedTo &&
                      task.assignedTo._id === user._id);
                  return (
                    <TableRow key={task._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={700}>{task.title}</Typography>
                          {user?.role === "Member" &&
                            task.assignedTo &&
                            task.assignedTo._id === user._id && (
                              <Chip
                                label="My Task"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            )}
                        </Stack>
                      </TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={
                            task.status === "Completed"
                              ? "success"
                              : task.status === "In Progress"
                              ? "primary"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          color={
                            task.priority === "High"
                              ? "error"
                              : task.priority === "Medium"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {task.assignedTo ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 14,
                                bgcolor: "secondary.main",
                              }}
                            >
                              {task.assignedTo.name[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {task.assignedTo.name}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{task.project?.title || "-"}</TableCell>
                      <TableCell>
                        {canEditDelete && (
                          <Stack direction="row" spacing={1}>
                            <Tooltip
                              title={
                                user?.role === "Admin"
                                  ? "Edit Task"
                                  : "Update Status"
                              }
                            >
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setEditForm({
                                    title: task.title,
                                    description: task.description,
                                    dueDate: task.dueDate
                                      ? task.dueDate.slice(0, 10)
                                      : "",
                                    status: task.status,
                                    priority: task.priority,
                                    assignedTo: task.assignedTo?._id || "",
                                    subTasks: task.subTasks || [],
                                    project: task.project?._id || "",
                                  });
                                  setEditOpen(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            {user?.role === "Admin" && (
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {/* Create Task Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  input={<OutlinedInput label="Status" />}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={form.priority}
                  onChange={handleFormChange}
                  input={<OutlinedInput label="Priority" />}
                >
                  {priorityOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleFormChange}
                  input={<OutlinedInput label="Assign To" />}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  name="project"
                  value={form.project}
                  onChange={handleFormChange}
                  input={<OutlinedInput label="Project" />}
                >
                  <MenuItem value="">None</MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Subtasks
                  </Typography>
                  {form.subTasks.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      No subtasks added.
                    </Typography>
                  )}
                  {form.subTasks.map((sub, idx) => (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      key={idx}
                    >
                      <TextField
                        label={`Subtask ${idx + 1}`}
                        value={sub.title}
                        onChange={(e) => {
                          const newSubs = [...form.subTasks];
                          newSubs[idx].title = e.target.value;
                          setForm((f) => ({ ...f, subTasks: newSubs }));
                        }}
                        size="small"
                        fullWidth
                      />
                      <IconButton
                        color="error"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            subTasks: f.subTasks.filter((_, i) => i !== idx),
                          }));
                        }}
                        aria-label="Remove subtask"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        subTasks: [...f.subTasks, { title: "" }],
                      }))
                    }
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1, alignSelf: "flex-start" }}
                  >
                    Add Subtask
                  </Button>
                </Stack>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!form.title || !form.status || !form.priority}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Task Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {user?.role === "Admin" ? "Edit Task" : "Update Task Status"}
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={editForm.title || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                required
                fullWidth
                disabled={user?.role !== "Admin"}
              />
              <TextField
                label="Description"
                name="description"
                value={editForm.description || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                multiline
                rows={2}
                fullWidth
                disabled={user?.role !== "Admin"}
              />
              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={editForm.dueDate || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={user?.role !== "Admin"}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value }))
                  }
                  input={<OutlinedInput label="Status" />}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={editForm.priority || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  input={<OutlinedInput label="Priority" />}
                  disabled={user?.role !== "Admin"}
                >
                  {priorityOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={editForm.assignedTo || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, assignedTo: e.target.value }))
                  }
                  input={<OutlinedInput label="Assign To" />}
                  disabled={user?.role !== "Admin"}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  name="project"
                  value={editForm.project || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, project: e.target.value }))
                  }
                  input={<OutlinedInput label="Project" />}
                  disabled={user?.role !== "Admin"}
                >
                  <MenuItem value="">None</MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {user?.role === "Admin" && (
                <FormControl fullWidth>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Subtasks
                    </Typography>
                    {editForm.subTasks?.length === 0 && (
                      <Typography color="text.secondary" variant="body2">
                        No subtasks added.
                      </Typography>
                    )}
                    {editForm.subTasks?.map((sub, idx) => (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        key={idx}
                      >
                        <TextField
                          label={`Subtask ${idx + 1}`}
                          value={sub.title}
                          onChange={(e) => {
                            const newSubs = [...editForm.subTasks];
                            newSubs[idx].title = e.target.value;
                            setEditForm((f) => ({ ...f, subTasks: newSubs }));
                          }}
                          size="small"
                          fullWidth
                        />
                        <Checkbox
                          checked={!!sub.completed}
                          onChange={(e) => {
                            const newSubs = [...editForm.subTasks];
                            newSubs[idx].completed = e.target.checked;
                            setEditForm((f) => ({ ...f, subTasks: newSubs }));
                          }}
                          inputProps={{ "aria-label": "Mark subtask complete" }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => {
                            setEditForm((f) => ({
                              ...f,
                              subTasks: f.subTasks.filter((_, i) => i !== idx),
                            }));
                          }}
                          aria-label="Remove subtask"
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          subTasks: [
                            ...(f.subTasks || []),
                            { title: "", completed: false },
                          ],
                        }))
                      }
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1, alignSelf: "flex-start" }}
                    >
                      Add Subtask
                    </Button>
                  </Stack>
                </FormControl>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                !editForm.title || !editForm.status || !editForm.priority
              }
            >
              {user?.role === "Admin" ? "Update" : "Update Status"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback (scaffolded) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
