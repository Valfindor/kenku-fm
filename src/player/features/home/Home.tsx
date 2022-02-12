import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddCircleRounded";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";

import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { PlaylistItem } from "../playlists/PlaylistItem";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import {
  useNavigate,
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

const PlaylistsLink = React.forwardRef<any, Omit<RouterLinkProps, "to">>(
  (props, ref) => <RouterLink ref={ref} to="/playlists" {...props} />
);

export function Home() {
  const navigate = useNavigate();
  const playlists = useSelector((state: RootState) => state.playlists);

  const playlistItems = playlists.playlists.allIds
    .slice(0, 4)
    .map((id) => playlists.playlists.byId[id]);

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 4,
        mb: "248px",
      }}
    >
      <Card>
        <CardContent>
          <Stack
            gap={1}
            justifyContent="space-between"
            alignItems="center"
            direction="row"
          >
            <Typography variant="h5" component="div">
              Playlists
            </Typography>
            <IconButton>
              <AddIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <Link color="inherit" underline="hover" component={PlaylistsLink}>
              See All
            </Link>
          </Stack>
        </CardContent>
        <CardContent>
          <Grid container spacing={2}>
            {playlistItems.map((playlist) => (
              <Grid xs={6} sm={4} md={3} item key={playlist.id}>
                <PlaylistItem
                  playlist={playlist}
                  onSelect={(id) => navigate(`/playlists/${id}`)}
                  onPlay={() => {}}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack
            gap={1}
            justifyContent="space-between"
            alignItems="center"
            direction="row"
          >
            <Typography variant="h5" component="div">
              Soundboards
            </Typography>
            <IconButton>
              <AddIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <Link href="#" color="inherit" underline="hover">
              See All
            </Link>
          </Stack>
        </CardContent>
        <CardContent>
          <Grid container></Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
