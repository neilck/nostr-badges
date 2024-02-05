"use client";

import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import EditIcon from "@mui/icons-material/Edit";
import { DeleteButton } from "./items/DeleteButton";
import { shortenDesc } from "@/app/utils/utils";
import { TextField } from "@mui/material";

export type Item = {
  id: string;
  name: string;
  description: string;
  image: string;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
};

const renderContent = (item: Item) => {
  const { id, name, description, image, onClick } = item;

  const shortDesc = shortenDesc(description, 60);
  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ width: 80, heigh: 80 }}>
        <CardMedia
          component="img"
          sx={{ width: 80, height: 80, objectFit: "contain" }}
          image={image}
          alt="badge image"
        />
      </Box>
      <Box sx={{ ml: 2, maxHeight: 80, pb: 1 }}>
        <Stack direction="column" justifyContent="left" alignItems="left">
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "16rem",
            }}
          >
            <Typography
              noWrap
              variant="body1"
              fontWeight={600}
              sx={{ minWidth: 0, pt: 0.5 }}
            >
              {name}
            </Typography>
          </div>

          <Typography variant="body2" display="block" whiteSpace="pre-wrap">
            {shortDesc}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export const ItemRow = (item: Item) => {
  const { id, name, description, image, onClick, onEdit, onDelete, readOnly } =
    item;
  return (
    <Card
      variant="elevation"
      sx={{
        border: 0,
        pt: 1,
        pl: 1,
        pr: 1,
        "&:hover": { backgroundColor: theme.palette.grey[200] },
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {onClick && (
        <CardActionArea
          onClick={() => {
            onClick(id);
          }}
        >
          {renderContent(item)}
        </CardActionArea>
      )}

      {!onClick && <>{renderContent(item)}</>}
      <Divider orientation="horizontal" flexItem sx={{ pt: 0.5 }} />
      {onClick && (
        <CardActions sx={{ width: "100%", p: 0, m: 0 }}>
          <Box display="flex" justifyContent="space-evenly" width="100%">
            <CardActionArea
              onClick={() => {
                if (onEdit) onEdit(id);
              }}
              sx={{
                color: theme.palette.grey[600],
                width: "100%",
                "&:hover": { backgroundColor: theme.palette.grey[200] },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  color: theme.palette.grey[400],
                  "&:hover": { color: theme.palette.grey[800] },
                  height: 32,
                }}
              >
                <EditIcon />
              </Box>
            </CardActionArea>
            <Divider orientation="vertical" variant="middle" flexItem />

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{
                color: theme.palette.grey[400],
                width: "30%",
              }}
            >
              <DeleteButton
                onClick={() => {
                  if (onDelete) onDelete(id);
                }}
              />
            </Box>
          </Box>
        </CardActions>
      )}
    </Card>
  );
};
