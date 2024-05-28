import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

export const Section = (props: {
  id: string;
  children: React.ReactNode;
  edit?: boolean;
  onEdit?: (id: string) => void;
}) => {
  const { id, children, onEdit } = props;
  const edit = props.edit == undefined ? false : props.edit;

  return (
    <div id={id} style={{ position: "relative", width: "100%" }}>
      {/* Box container */}
      <Box
        sx={{
          border: 1,
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.grey[400],
          borderRadius: 2,
          padding: 1,
          width: "100%",
          minHeight: "20px",
          position: "relative", // Ensure relative positioning
        }}
      >
        {/* Children content */}
        {children}

        {/* Edit icon positioned on top right */}
        {onEdit && (
          <>
            <IconButton
              sx={{
                position: "absolute",
                top: theme.spacing(0),
                right: theme.spacing(0),
                backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: semi-transparent background
              }}
              aria-label="edit"
              onClick={() => {
                if (onEdit) {
                  onEdit(id);
                }
              }}
            >
              {!edit && <EditIcon />}
              {edit && <CancelIcon />}
            </IconButton>
          </>
        )}
      </Box>
    </div>
  );
};
