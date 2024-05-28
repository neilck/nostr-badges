import { Badge, DataField } from "@/data/badgeLib";
import { BadgeAward } from "@/data/badgeAwardLib";

import Box from "@mui/material/Box";
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
  const formatted = badgeAward.created.toDate().toLocaleString();
  let dataLines: string[] = [];

  if (badgeAward.data) {
    // replace key name with label from badge if available
    const initialFields: DataField[] = [];
    const dataFields = badge.dataFields;
    Object.entries(badgeAward.data).map(([key, value]) => {
      let label = key;
      for (let i = 0; i < dataFields.length; i++) {
        if (dataFields[i].name == key) {
          label = dataFields[i].label ?? label;
        }
        break;
      }
      dataLines.push(`${label}: ${value}`);
    });
  }

  return (
    <Box>
      <ItemRowSmall
        id={id}
        name={badge.name}
        description={badge.description}
        image={badge.image}
        widthOption="wide"
      />

      <Box pl={1} pt={0.5} maxWidth="300px">
        <Typography variant="body2" fontWeight="semibold">
          {formatted}
        </Typography>
        {dataLines.length > 1 &&
          dataLines.map((line, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ overflowWrap: "break-word" }}
            >
              {line}
            </Typography>
          ))}
      </Box>
    </Box>
  );
};
