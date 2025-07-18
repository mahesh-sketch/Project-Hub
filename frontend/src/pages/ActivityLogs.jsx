import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";

export default function ActivityLogs() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/activity-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [token]);

  return (
    <Layout>
      <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", mt: 2 }}>
        <Typography variant="h4" fontWeight={900} color="primary" mb={3}>
          Activity Logs
        </Typography>
        {loading ? (
          <Stack alignItems="center" mt={6}>
            <CircularProgress color="primary" />
          </Stack>
        ) : logs.length === 0 ? (
          <Typography color="text.secondary" align="center" mt={4}>
            No activity logs found.
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Date/Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={log.user?.name?.[0] || "?"}
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                        <Typography fontWeight={700}>
                          {log.user?.name || "Unknown"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} color="secondary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.targetType}
                        color={
                          log.targetType === "Project" ? "primary" : "success"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Layout>
  );
}
