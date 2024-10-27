import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import routes from "./routes";

describe("Image Processing Routes", () => {
  const app = new Elysia().use(routes);
  const testImageUrl = "https://napkinsdev.s3.us-east-1.amazonaws.com/next-s3-uploads/91061dca-cebc-4215-ab2c-8bde6cb46cac/trader-wafer.JPG";
  const testPublicId = "trader-wafer-test";

  it("should upload an image", async () => {
    const response = await app
      .handle(new Request("http://localhost/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          publicId: testPublicId,
        }),
      }));

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.result.public_id).toBe(testPublicId);
  });

  it("should get optimized image URL", async () => {
    const response = await app
      .handle(new Request("http://localhost/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: testImageUrl
        }),
      }));

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
  });

  it("should get auto-cropped image URL", async () => {
    const response = await app
      .handle(new Request("http://localhost/autocrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          width: "500",
          height: "500"
        }),
      }));

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
  });

  it("should get background-replaced image URL", async () => {
    const response = await app
      .handle(new Request("http://localhost/replace-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          prompt: "beautiful sunset beach",
        }),
      }));

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
  });
});