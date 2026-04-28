export async function downloadFile(
  filePath: string,
  fileName: string
): Promise<void> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("File not found");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
