import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    const authorFid = searchParams.get("authorFid");
    const authorName = searchParams.get("authorName") || "Author";
    const balance = searchParams.get("balance") || "0";
    const badge = searchParams.get("badge") || "";

    // Fetch story data if storyId provided
    let storyPreview = "";
    if (storyId) {
      try {
        const baseUrl = request.nextUrl.origin;
        const res = await fetch(`${baseUrl}/api/stories?id=${storyId}`);
        const data = await res.json();
        if (data.story?.lines?.length > 0) {
          const firstLine = data.story.lines[0];
          storyPreview = firstLine.content.substring(0, 100);
          if (firstLine.content.length > 100) storyPreview += "...";
        }
      } catch (error) {
        console.error("Failed to fetch story:", error);
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
            backgroundImage:
              "linear-gradient(135deg, #0052FF 0%, #8B5CF6 100%)",
            padding: "80px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: "20px",
                fontFamily: "system-ui",
              }}
            >
              LORE MACHINE
            </div>
            <div
              style={{
                fontSize: "32px",
                color: "#FFFFFF",
                opacity: 0.9,
                fontFamily: "system-ui",
              }}
            >
              I just became an Author of crypto history
            </div>
          </div>

          {/* Author Badge */}
          {badge && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#8B5CF6",
                padding: "12px 24px",
                borderRadius: "12px",
                marginBottom: "40px",
                fontFamily: "system-ui",
              }}
            >
              <span style={{ fontSize: "24px", color: "#FFFFFF" }}>
                {badge}
              </span>
            </div>
          )}

          {/* Story Preview */}
          {storyPreview && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "800px",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  color: "#FFFFFF",
                  textAlign: "center",
                  lineHeight: "1.6",
                  fontFamily: "system-ui",
                }}
              >
                "{storyPreview}"
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                color: "#FFFFFF",
                opacity: 0.8,
                fontFamily: "system-ui",
              }}
            >
              by @{authorName}
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#FFFFFF",
                opacity: 0.8,
                fontFamily: "system-ui",
              }}
            >
              • {balance} $LORE
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}

