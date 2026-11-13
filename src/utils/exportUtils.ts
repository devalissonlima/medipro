import type { Measurement } from "@/types/measurement"
import { formatCurrency } from "./calculations"

/**
 * Utilitário puro para exportação de dados de medições em CSV (compatível com Excel/Google Sheets)
 */
export function exportMeasurementsToCSV(
  measurements: Measurement[],
  filename = "medicoes-medipro.csv"
): void {
  if (!measurements || measurements.length === 0) return

  // Cabeçalhos em português com separador ponto-e-vírgula padrão PT-BR
  const headers = [
    "ID",
    "Título",
    "Obra / Projeto",
    "Cliente",
    "Colaborador",
    "Data",
    "Status",
    "Qtd Itens",
    "Total Serviços (R$)",
    "Total Despesas (R$)",
    "Valor Total (R$)",
    "Localização",
  ]

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return ""
    const stringValue = String(value).replace(/"/g, '""')
    if (
      stringValue.includes(";") ||
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue}"`
    }
    return stringValue
  }

  const rows = measurements.map((m) => [
    escapeCSV(m.id),
    escapeCSV(m.title),
    escapeCSV(m.projectTitle || "Sem projeto vinculado"),
    escapeCSV(m.clientName || "Cliente não informado"),
    escapeCSV(m.collaboratorName || "Profissional"),
    escapeCSV(m.date),
    escapeCSV(
      m.status === "approved"
        ? "Aprovada"
        : m.status === "pending"
        ? "Pendente"
        : m.status === "rework"
        ? "Para Ajustar"
        : m.status === "rejected"
        ? "Rejeitada"
        : "Rascunho"
    ),
    escapeCSV(m.items.length),
    escapeCSV(m.servicesTotal.toFixed(2)),
    escapeCSV(m.costsTotal.toFixed(2)),
    escapeCSV(m.grandTotal.toFixed(2)),
    escapeCSV(m.location || ""),
  ])

  const csvContent =
    "\uFEFF" + // BOM para forçar UTF-8 no Excel
    headers.join(";") +
    "\n" +
    rows.map((row) => row.join(";")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Utilitário para exportação/impressão de documento técnico em PDF de uma Medição
 */
export function exportMeasurementToPDF(measurement: Measurement): void {
  const printWindow = window.open("", "_blank", "width=850,height=900")
  if (!printWindow) {
    window.print()
    return
  }

  const itemsRows = measurement.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 10px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">
          ${item.serviceName}
          ${
            item.materialName
              ? `<br><span style="font-size: 11px; font-weight: normal; color: #64748b;">Material: ${item.materialName}</span>`
              : ""
          }
        </td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace;">${item.quantity} ${item.unit}</td>
        <td style="padding: 10px 8px; text-align: right; font-family: monospace;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; font-family: monospace; color: #0f172a;">${formatCurrency(item.subtotal)}</td>
      </tr>
    `
    )
    .join("")

  const operationalCostsSection =
    measurement.operationalCosts && measurement.costsTotal > 0
      ? `
      <div style="margin-top: 24px; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <h4 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Despesas Operacionais de Campo</h4>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 11px;">
          ${measurement.operationalCosts.transport ? `<div><span style="color: #64748b;">Transporte:</span><br><strong>${formatCurrency(measurement.operationalCosts.transport)}</strong></div>` : ""}
          ${measurement.operationalCosts.lodging ? `<div><span style="color: #64748b;">Hospedagem:</span><br><strong>${formatCurrency(measurement.operationalCosts.lodging)}</strong></div>` : ""}
          ${measurement.operationalCosts.food ? `<div><span style="color: #64748b;">Alimentação:</span><br><strong>${formatCurrency(measurement.operationalCosts.food)}</strong></div>` : ""}
          ${measurement.operationalCosts.extraSetup ? `<div><span style="color: #64748b;">Setup/Risco:</span><br><strong>${formatCurrency(measurement.operationalCosts.extraSetup)}</strong></div>` : ""}
        </div>
        ${measurement.operationalCosts.notes ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b; font-style: italic;">Obs: ${measurement.operationalCosts.notes}</p>` : ""}
      </div>
    `
      : ""

  const statusLabel =
    measurement.status === "approved"
      ? "APROVADA"
      : measurement.status === "pending"
      ? "PENDENTE DE APROVAÇÃO"
      : measurement.status === "rework"
      ? "SOLICITAÇÃO DE AJUSTE"
      : measurement.status === "rejected"
      ? "REJEITADA"
      : "RASCUNHO"

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Medição - ${measurement.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #fff; }
        @media print {
          body { padding: 16px; }
          @page { margin: 1.5cm; }
        }
      </style>
    </head>
    <body>
      <!-- Cabeçalho -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.03em;">Medi<span style="color: #f59e0b;">Pro</span></div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Relatório Técnico Operacional de Medição & Serviços</p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a;">${statusLabel}</span>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b;">Ref: #${measurement.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <!-- Detalhes do Projeto e Cliente -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${measurement.title}</div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 2px;"><strong>Obra / Projeto:</strong> ${measurement.projectTitle || "Serviço Avulso"}</div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 2px;"><strong>Cliente:</strong> ${measurement.clientName || "Não informado"}</div>
          ${measurement.location ? `<div style="font-size: 12px; color: #475569;"><strong>Local:</strong> ${measurement.location}</div>` : ""}
        </div>
        <div style="text-align: right; font-size: 12px; color: #475569;">
          <div style="margin-bottom: 4px;"><strong>Data de Execução:</strong> ${measurement.date}</div>
          <div><strong>Responsável / Instalador:</strong><br>${measurement.collaboratorName || "Profissional da Obra"}</div>
        </div>
      </div>

      <!-- Tabela de Itens -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
            <th style="padding: 10px 8px; text-align: center; width: 36px;">Item</th>
            <th style="padding: 10px 8px; text-align: left;">Descrição do Serviço</th>
            <th style="padding: 10px 8px; text-align: center; width: 100px;">Quantidade</th>
            <th style="padding: 10px 8px; text-align: right; width: 120px;">Valor Unit.</th>
            <th style="padding: 10px 8px; text-align: right; width: 130px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${operationalCostsSection}

      <!-- Fechamento Financeiro -->
      <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
        <div style="width: 280px; padding: 16px; border: 2px solid #0f172a; border-radius: 8px; background: #f8fafc;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #475569;">
            <span>Subtotal de Serviços:</span>
            <span style="font-family: monospace; font-weight: 600;">${formatCurrency(measurement.servicesTotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; color: #475569;">
            <span>Despesas Operacionais:</span>
            <span style="font-family: monospace; font-weight: 600;">${formatCurrency(measurement.costsTotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; border-top: 1px solid #cbd5e1; padding-top: 8px; color: #0f172a;">
            <span>TOTAL GERAL:</span>
            <span style="font-family: monospace; color: #059669;">${formatCurrency(measurement.grandTotal)}</span>
          </div>
        </div>
      </div>

      <!-- Assinaturas -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; padding-top: 24px; text-align: center;">
        <div>
          <div style="border-top: 1px solid #94a3b8; width: 80%; margin: 0 auto 8px auto;"></div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${measurement.collaboratorName || "Profissional Responsável"}</div>
          <div style="font-size: 11px; color: #64748b;">Executor da Medição</div>
        </div>
        <div>
          <div style="border-top: 1px solid #94a3b8; width: 80%; margin: 0 auto 8px auto;"></div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${measurement.clientName || "Cliente / Fiscal da Obra"}</div>
          <div style="font-size: 11px; color: #64748b;">Aprovação / Conferência</div>
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 350)
}

/**
 * Utilitário para exportação/impressão de Relatório Geral em PDF com múltiplas medições da obra
 */
export function exportMultipleMeasurementsToPDF(
  measurements: Measurement[],
  projectTitle = "Relatório Consolidado de Medições"
): void {
  const printWindow = window.open("", "_blank", "width=900,height=900")
  if (!printWindow) {
    window.print()
    return
  }

  const totalValue = measurements.reduce((acc, m) => acc + m.grandTotal, 0)
  const approvedTotal = measurements
    .filter((m) => m.status === "approved")
    .reduce((acc, m) => acc + m.grandTotal, 0)
  const pendingTotal = measurements
    .filter((m) => m.status === "pending")
    .reduce((acc, m) => acc + m.grandTotal, 0)

  const rows = measurements
    .map(
      (m, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 10px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">${m.title}</td>
        <td style="padding: 10px 8px; color: #475569;">${m.collaboratorName || "Profissional"}</td>
        <td style="padding: 10px 8px; text-align: center; color: #64748b;">${m.date}</td>
        <td style="padding: 10px 8px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #f1f5f9; color: #334155;">
            ${
              m.status === "approved"
                ? "Aprovada"
                : m.status === "pending"
                ? "Pendente"
                : m.status === "rework"
                ? "Para Ajustar"
                : m.status === "rejected"
                ? "Rejeitada"
                : "Rascunho"
            }
          </span>
        </td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; font-family: monospace; color: #0f172a;">
          ${formatCurrency(m.grandTotal)}
        </td>
      </tr>
    `
    )
    .join("")

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${projectTitle}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #fff; }
        @media print { body { padding: 16px; } @page { margin: 1.5cm; } }
      </style>
    </head>
    <body>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 24px; font-weight: 900;">Medi<span style="color: #f59e0b;">Pro</span></div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">${projectTitle}</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          Emitido em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div style="padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Aprovado</div>
          <div style="font-size: 18px; font-weight: 800; color: #059669; font-family: monospace; margin-top: 4px;">${formatCurrency(approvedTotal)}</div>
        </div>
        <div style="padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Aguardando Aprovação</div>
          <div style="font-size: 18px; font-weight: 800; color: #d97706; font-family: monospace; margin-top: 4px;">${formatCurrency(pendingTotal)}</div>
        </div>
        <div style="padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Volume Geral (${measurements.length} medições)</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 4px;">${formatCurrency(totalValue)}</div>
        </div>
      </div>

      <!-- Tabela -->
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569;">
            <th style="padding: 10px 8px; text-align: center; width: 36px;">#</th>
            <th style="padding: 10px 8px; text-align: left;">Medição</th>
            <th style="padding: 10px 8px; text-align: left;">Profissional</th>
            <th style="padding: 10px 8px; text-align: center; width: 100px;">Data</th>
            <th style="padding: 10px 8px; text-align: center; width: 120px;">Status</th>
            <th style="padding: 10px 8px; text-align: right; width: 130px;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 350)
}
