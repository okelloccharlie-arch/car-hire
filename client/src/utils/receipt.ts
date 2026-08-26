import jsPDF from "jspdf";
import { Booking } from "../types";
import { formatMoney } from "./format";

const NAVY: [number, number, number] = [26, 44, 70]; // #1a2c46
const AMBER: [number, number, number] = [243, 161, 58]; // #f3a13a
const GRAY: [number, number, number] = [130, 150, 184]; // #8296b8

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
}

// Fetches an image URL and converts it into a data URL jsPDF can embed, along
// with its pixel dimensions so we can keep the correct aspect ratio.
// Returns null on any failure so the receipt still generates without a photo.
async function loadImageAsDataUrl(url: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });

    const match = dataUrl.match(/^data:image\/(\w+);/);
    const subtype = match?.[1]?.toLowerCase() ?? "jpeg";
    const format = subtype === "jpg" ? "JPEG" : subtype.toUpperCase();

    return { dataUrl, width, height, format };
  } catch {
    return null;
  }
}

export async function downloadBookingReceipt(booking: Booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SmartRental", 20, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("Booking Receipt", pageWidth - 20, y - 6, { align: "right" });
  doc.text(`Issued ${new Date().toLocaleString()}`, pageWidth - 20, y, { align: "right" });

  y += 6;
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(1);
  doc.line(20, y, pageWidth - 20, y);
  y += 12;

  // Reference
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Booking Reference: ${booking.id.slice(0, 8).toUpperCase()}`, 20, y);
  y += 10;

  // Car photo, centered, aspect-ratio preserved, capped to a sensible box
  if (booking.car.image) {
    const img = await loadImageAsDataUrl(booking.car.image);
    if (img) {
      const maxW = 100;
      const maxH = 55;
      let w = maxW;
      let h = (img.height / img.width) * maxW;
      if (h > maxH) {
        h = maxH;
        w = (img.width / img.height) * maxH;
      }
      const x = (pageWidth - w) / 2;
      doc.addImage(img.dataUrl, img.format, x, y, w, h);
      y += h + 10;
    }
  }

  // Two-column: Customer / Car
  const colX2 = pageWidth / 2 + 5;
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("CUSTOMER", 20, y);
  doc.text("VEHICLE", colX2, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  const customerName = booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : "—";
  doc.text(customerName, 20, y);
  doc.text(`${booking.car.brand} ${booking.car.model} (${booking.car.year})`, colX2, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(booking.user?.email ?? "", 20, y);
  doc.text(`${booking.car.transmission} · ${booking.car.fuelType} · ${booking.car.seats} seats`, colX2, y);
  y += 16;

  // Divider
  doc.setDrawColor(230, 234, 240);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 12;

  // Booking details table (simple rows)
  const days = daysBetween(booking.startDate, booking.endDate);
  const rows: [string, string][] = [
    ["Pickup", new Date(booking.startDate).toLocaleString()],
    ["Return", new Date(booking.endDate).toLocaleString()],
    ["Duration", `${days} day${days > 1 ? "s" : ""}`],
    ["Package", booking.driveType === "CHAUFFEUR" ? "Chauffeur-driven" : "Self-drive"],
    ["Status", booking.status],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setTextColor(...GRAY);
    doc.text(label, 20, y);
    doc.setTextColor(...NAVY);
    doc.text(value, 80, y);
    y += 8;
  });

  y += 6;
  doc.setDrawColor(230, 234, 240);
  doc.line(20, y, pageWidth - 20, y);
  y += 14;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Total Amount", 20, y);
  doc.text(`Ksh ${formatMoney(booking.totalPrice)}`, pageWidth - 20, y, { align: "right" });
  y += 20;

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Questions about this booking?", 20, y);
  y += 5;
  doc.text("admin@carrental.com  ·  WhatsApp +254 705 155 219", 20, y);

  doc.save(`receipt-${booking.id.slice(0, 8)}.pdf`);
}