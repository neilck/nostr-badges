"use server";

const apiKey = process.env.YOUTUBE_API_KEY;

interface GetChannelResult {
  success: boolean;
  error: string;
  title: string;
  description: string;
  customUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

const getChannel = async (handle: string): Promise<GetChannelResult> => {
  const result = {
    success: false,
    error: "",
    title: "",
    description: "",
    customUrl: "",
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
  };

  if (!handle || Array.isArray(handle)) {
    result.success = false;
    result.error = "handle not found in Channel URL";
    return result;
  }

  try {
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${handle}&key=${apiKey}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      result.success = false;
      result.error = `channel for ${handle} not found`;
      return result;
    }

    const snippet = channelData.items[0].snippet;
    const statistics = channelData.items[0].statistics;
    result.success = true;
    result.title = snippet.title;
    result.description = snippet.description as string;
    result.customUrl = snippet.customUrl;
    if (statistics) {
      result.subscriberCount = statistics.subscriberCount;
      result.videoCount = statistics.videoCount;
      result.viewCount = statistics.viewCount;
    }

    console.log(snippet);
    console.log(result);
    return result;
  } catch (error) {
    result.success = false;
    result.error = JSON.stringify(error);

    return result;
  }
};

export default getChannel;
