import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
  Box,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Projects() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Active",
    assignedUsers: [],
  });
  const [editForm, setEditForm] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [token]);

  // Fetch users for assignment (only for Admin)
  useEffect(() => {
    if (user?.role === "Admin") {
      axios
        .get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsers(res.data))
        .catch(() => setUsers([]));
    }
  }, [token, user]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAssignedUsersChange = (e) => {
    setForm((f) => ({ ...f, assignedUsers: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/projects", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Project created successfully!",
        severity: "success",
      });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "Active",
        assignedUsers: [],
      });
      refreshProjects();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create project",
        severity: "error",
      });
    }
  };

  // Edit logic
  const handleEditOpen = (project) => {
    setSelectedProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
      status: project.status,
      assignedUsers: project.assignedUsers.map((u) => u._id),
    });
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };
  const handleEditAssignedUsersChange = (e) => {
    setEditForm((f) => ({ ...f, assignedUsers: e.target.value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${selectedProject._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Project updated successfully!",
        severity: "success",
      });
      setEditOpen(false);
      refreshProjects();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update project",
        severity: "error",
      });
    }
  };

  // Delete logic
  const handleDeleteOpen = (project) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => setDeleteOpen(false);
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/projects/${selectedProject._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Project deleted successfully!",
        severity: "success",
      });
      setDeleteOpen(false);
      refreshProjects();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete project",
        severity: "error",
      });
    }
  };

  // Refresh projects list
  const refreshProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={900} color="primary">
            Projects
          </Typography>
          {user?.role === "Admin" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 700 }}
              onClick={handleOpen}
            >
              Create Project
            </Button>
          )}
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
        ) : projects.length === 0 ? (
          <Typography color="text.secondary" align="center" mt={4}>
            No projects found.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card
                  elevation={5}
                  sx={{
                    borderTop: 4,
                    borderColor: "primary.main",
                    borderRadius: 3,
                  }}
                >
                  <CardHeader
                    title={
                      <Typography variant="h6" fontWeight={700}>
                        {project.title}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="text.secondary">
                        {project.status} &bull;{" "}
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : "Ongoing"}
                      </Typography>
                    }
                    action={
                      user?.role === "Admin" && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditOpen(project)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteOpen(project)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )
                    }
                  />
                  <CardContent>
                    <Typography variant="body1" mb={2}>
                      {project.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={1}
                    >
                      <GroupIcon color="action" />
                      {project.assignedUsers &&
                      project.assignedUsers.length > 0 ? (
                        <AvatarGroup users={project.assignedUsers} />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No members assigned
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Chip
                        label={project.status}
                        color={
                          project.status === "Active"
                            ? "success"
                            : project.status === "Completed"
                            ? "primary"
                            : "warning"
                        }
                        size="small"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* Create Project Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
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
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
                <TextField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  input={<OutlinedInput label="Status" />}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign Users</InputLabel>
                <Select
                  multiple
                  name="assignedUsers"
                  value={form.assignedUsers}
                  onChange={handleAssignedUsersChange}
                  input={<OutlinedInput label="Assign Users" />}
                  renderValue={(selected) =>
                    users
                      .filter((u) => selected.includes(u._id))
                      .map((u) => u.name)
                      .join(", ")
                  }
                >
                  {users
                    .filter((u) => u.role === "Member")
                    .map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        <Checkbox
                          checked={form.assignedUsers.indexOf(u._id) > -1}
                        />
                        <ListItemText primary={u.name} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={editForm.title || ""}
                onChange={handleEditFormChange}
                required
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={editForm.description || ""}
                onChange={handleEditFormChange}
                multiline
                rows={2}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={editForm.startDate || ""}
                  onChange={handleEditFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
                <TextField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={editForm.endDate || ""}
                  onChange={handleEditFormChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editForm.status || ""}
                  onChange={handleEditFormChange}
                  input={<OutlinedInput label="Status" />}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign Users</InputLabel>
                <Select
                  multiple
                  name="assignedUsers"
                  value={editForm.assignedUsers || []}
                  onChange={handleEditAssignedUsersChange}
                  input={<OutlinedInput label="Assign Users" />}
                  renderValue={(selected) =>
                    users
                      .filter((u) => selected.includes(u._id))
                      .map((u) => u.name)
                      .join(", ")
                  }
                >
                  {users
                    .filter((u) => u.role === "Member")
                    .map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        <Checkbox
                          checked={editForm.assignedUsers?.indexOf(u._id) > -1}
                        />
                        <ListItemText primary={u.name} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project{" "}
            <b>{selectedProject?.title}</b>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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

// Helper component for showing assigned users as avatars
function AvatarGroup({ users }) {
  return (
    <Stack direction="row" spacing={-1} alignItems="center">
      {users.slice(0, 3).map((u) => (
        <Avatar
          key={u._id}
          sx={{
            width: 28,
            height: 28,
            fontSize: 14,
            bgcolor: "secondary.main",
            border: "2px solid #fff",
          }}
          title={u.name}
        >
          {u.name[0]}
        </Avatar>
      ))}
      {users.length > 3 && (
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: 14,
            bgcolor: "grey.400",
            border: "2px solid #fff",
          }}
        >
          +{users.length - 3}
        </Avatar>
      )}
    </Stack>
  );
}
