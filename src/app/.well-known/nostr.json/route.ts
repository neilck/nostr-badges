export async function GET(request: Request) {
  let name: string | null = null;
  const tokens = request.url.split("?");

  if (tokens.length > 1) {
    const searchParams = new URLSearchParams(tokens[tokens.length - 1]);
    name = searchParams.get("name");
  }

  if (!name) {
    // Return an empty response with Access-Control-Allow-Origin header
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };
    const emptyResponse = new Response(JSON.stringify({ names: {} }), {
      headers,
    });
    return emptyResponse;
  }

  // Process the request and return the response with Access-Control-Allow-Origin header
  const names: Record<string, string> = {};
  const pubkey = "PUBKEY";
  names[name] = pubkey;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const jsonResponse = new Response(JSON.stringify({ names }), { headers });
  return jsonResponse;
}
