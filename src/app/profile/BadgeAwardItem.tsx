import { Badge, DataField } from "@/data/badgeLib";
import { BadgeAward } from "@/data/badgeAwardLib";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Typography from "@mui/material/Typography";

import { ItemRowSmall } from "../components/ItemRowSmall";

export const BadgeAwardItem = ({
  id,
  badgeAward,
  badge,
}: {
  id: string;
  badgeAward: BadgeAward;
  badge: Badge;
}) => {
  // @ts-ignore
  const formattedDate = badgeAward.created.toDate().toLocaleDateString();
  const link = `${process.env.NEXT_PUBLIC_AKA_GET}/njump/${badge.event}`;
  let data: { label: string; value: string; description: string }[] = [];

  const textWidth = "296px"; // 220px + 44px + padding from ItemRowSmall wide and short

  if (badgeAward.data) {
    // replace key name with label from badge if available
    const initialFields: DataField[] = [];
    const dataFields = badge.dataFields;

    Object.entries(badgeAward.data).map(([key, value]) => {
      let label = key;
      for (let i = 0; i < dataFields.length; i++) {
        const field = dataFields[i];
        if (field.name == key) {
          data.push({
            label: field.label ?? label,
            value: value,
            description: field.description ?? "",
          });
        }
      }
    });
  }

  return (
    <Box>
      <Link href={link} underline="none">
        <ItemRowSmall
          id={id}
          name={badge.name}
          description={badge.description}
          image={badge.image}
          widthOption="wide"
          heightOption="short"
        />
      </Link>

      {data.length > 0 && (
        <Box
          sx={{ width: textWidth, pl: "10px", pr: "4px", pt: "4px", pb: "4px" }}
        >
          <TableContainer>
            <Table size="small">
              <TableBody sx={{ border: "none" }}>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        border: "none",
                        padding: "0px",
                        verticalAlign: "top",
                      }}
                    >
                      {item.label}:
                    </TableCell>
                    <TableCell
                      sx={{ border: "none", padding: "0px", pl: "8px" }}
                    >
                      {item.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Box pl={1} pt={0.5} maxWidth="300px">
        <Typography variant="subtitle2" fontWeight="semibold">
          awarded {formattedDate} by
        </Typography>
      </Box>
    </Box>
  );
};
