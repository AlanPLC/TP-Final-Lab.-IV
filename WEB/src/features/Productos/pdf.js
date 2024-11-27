import { jsPDF } from "jspdf";

export default function generarPDF() {
  // Crear una instancia del documento PDF
  const doc = new jsPDF();

  // Agregar contenido
  doc.text("Título del documento", 10, 10); // Texto en x:10, y:10
  doc.text("Este es un PDF generado dinámicamente.", 10, 20);

  // Guardar el PDF
  doc.save("documento.pdf");
};
