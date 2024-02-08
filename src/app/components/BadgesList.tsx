"use client";
import Stack from "@mui/material/Stack";
import { BadgeRowSmall } from "./BadgeRowSmall";

export type RecordItem = {
  name: string;
  image: string;
  thumbnail?: string;
};

export const BadgesList = (props: { records: Record<string, RecordItem> }) => {
  const { records } = props;

  if (Object.keys(records).length == 0) return <></>;

  return (
    <Stack spacing={1}>
      {Object.keys(records).map((key) => {
        const record = records[key];
        let imageUrl = "";
        imageUrl =
          record.thumbnail && record.thumbnail != ""
            ? record.thumbnail
            : record.image;
        return (
          <BadgeRowSmall
            key={key}
            name={record.name}
            image={imageUrl}
          ></BadgeRowSmall>
        );
      })}
    </Stack>
  );
};
