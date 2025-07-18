import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
      } catch (err) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-4 bg-white/80 px-4 py-2 rounded-xl shadow">
            <div className="text-right">
              <div className="font-semibold text-indigo-700">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="text-xs text-indigo-500 font-medium capitalize">
                {user?.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto mt-8">
          <Typography
            variant="h4"
            fontWeight={900}
            color="primary"
            align="center"
            gutterBottom
          >
            Welcome, {user?.name}!
          </Typography>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={200}
            >
              <Box className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </Box>
          ) : stats ? (
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Card
                  elevation={6}
                  sx={{
                    borderTop: 4,
                    borderColor: "primary.main",
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <FolderIcon color="primary" sx={{ fontSize: 40 }} />
                      <Typography variant="h5" fontWeight={700} color="primary">
                        Projects
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      color="primary.main"
                      align="center"
                    >
                      {stats.totalProjects}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      mt={2}
                      flexWrap="wrap"
                    >
                      {stats.projectsByStatus.map((s) => (
                        <Chip
                          key={s._id}
                          label={`${s._id}: ${s.count}`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  elevation={6}
                  sx={{
                    borderTop: 4,
                    borderColor: "secondary.main",
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <AssignmentTurnedInIcon
                        color="secondary"
                        sx={{ fontSize: 40 }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="secondary"
                      >
                        Tasks
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      color="secondary.main"
                      align="center"
                    >
                      {stats.totalTasks}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      mt={2}
                      flexWrap="wrap"
                    >
                      {stats.tasksByStatus.map((s) => (
                        <Chip
                          key={s._id}
                          label={`${s._id}: ${s.count}`}
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      ))}
                      {stats.tasksByPriority.map((s) => (
                        <Chip
                          key={s._id}
                          label={`${s._id}: ${s.count}`}
                          color="warning"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography color="error" align="center" fontWeight={700} mt={4}>
              Failed to load dashboard stats.
            </Typography>
          )}
        </div>
      </div>
    </Layout>
  );
}
