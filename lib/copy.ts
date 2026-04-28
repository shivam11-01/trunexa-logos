export async function copySvgToClipboard(filePath: string): Promise<void> {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error("File not found");
  const svgText = await response.text();
  await navigator.clipboard.writeText(svgText);
}

export async function copyPngToClipboard(filePath: string): Promise<void> {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error("File not found");
  const blob = await response.blob();

  // Convert to PNG if not already
  const pngBlob =
    blob.type === "image/png"
      ? blob
      : await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas not supported"));
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error("Blob conversion failed"));
            }, "image/png");
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": pngBlob }),
  ]);
}
