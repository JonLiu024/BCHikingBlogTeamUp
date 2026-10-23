import { useEffect, useState } from "react";
import { Box, Image, Progress, Text } from "@chakra-ui/react";
import { downloadJournalFile } from "../media/journalTransfer";

const percent = (loaded, total) => (total ? Math.round((loaded / total) * 100) : 0);

export function JournalMedia({ url, kind }) {
  const [src, setSrc] = useState("");
  const [mime, setMime] = useState("");
  const [progress, setProgress] = useState(0);
  const [direct, setDirect] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    setSrc("");
    setProgress(0);
    setDirect(false);
    downloadJournalFile(url, (message) => {
      if (!cancelled) setProgress(percent(message.loaded, message.total));
    })
      .then(({ blob, mime: downloaded }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setMime(downloaded);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setDirect(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  const type = mime || (kind === "video" ? "video/mp4" : "image/jpeg");
  const shown = src || (direct ? url : "");
  const video = type.startsWith("video") || kind === "video";

  return (
    <Box mt={3}>
      {!shown && (
        <Box>
          <Progress value={progress} size="sm" colorScheme="green" borderRadius="full" />
          <Text fontSize="xs" color="gray.600" mt={1}>
            Downloaded {progress}%.
          </Text>
        </Box>
      )}
      {shown && video && <video src={shown} controls style={{ maxWidth: "100%", maxHeight: 320 }} />}
      {shown && !video && <Image src={shown} alt="" borderRadius="md" maxH="320px" />}
    </Box>
  );
}

export function JournalMediaList({ images = [], videos = [] }) {
  const items = [
    ...images.map((url) => ({ url, kind: "image" })),
    ...videos.map((url) => ({ url, kind: "video" })),
  ];
  if (items.length === 0) return null;
  return items.map((item) => <JournalMedia key={item.url} url={item.url} kind={item.kind} />);
}

export function UploadProgress({ items }) {
  if (!items.length) return null;
  return items.map((item) => {
    const received = percent(item.loaded, item.total);
    const saved = percent(item.stored, item.total);
    return (
      <Box key={`${item.file.name}-${item.file.size}`} mb={3}>
        <Text fontSize="sm">{item.file.name}</Text>
        <Progress value={received} size="sm" colorScheme="green" borderRadius="full" />
        <Text fontSize="xs" color="gray.600" mt={1}>
          Received {received}%. Saved {saved}%.
        </Text>
      </Box>
    );
  });
}
