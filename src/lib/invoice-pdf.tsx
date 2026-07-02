import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  type InvoiceSpec,
  type PaymentProfile,
  lineAmount,
  subtotal,
  taxAmount,
  grandTotal,
  taxNote,
  formatMoney,
  formatDate,
} from "./invoice";
import { issuer } from "@/content/invoices/config";

/**
 * Built-in fonts only (see agreement-pdf.tsx): remote font fetches
 * silently fail on cold starts and tank the render.
 */
const SANS = "Helvetica";

const INK = "#0a0a0a";
const MUTED = "#6b6b6b";
const HAIR = "#d9d9d9";
const PANEL = "#f4f4f4";

const styles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: SANS,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: INK,
  },
  title: {
    fontSize: 28,
    letterSpacing: 3,
    fontWeight: 600,
  },
  titleRule: {
    borderBottomWidth: 1,
    borderBottomColor: INK,
    marginTop: 10,
    marginBottom: 24,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  issuerBlock: {
    alignItems: "flex-end",
    maxWidth: "48%",
  },
  issuerName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  issuerLine: {
    fontSize: 9,
    color: MUTED,
    textAlign: "right",
  },
  billToLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 6,
  },
  billToName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  billToLine: {
    fontSize: 9,
    color: MUTED,
  },
  metaBlock: {
    alignSelf: "flex-end",
    width: 220,
    marginBottom: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  metaLabel: {
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PANEL,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: 700,
    color: MUTED,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIR,
  },
  colDesc: { flex: 1, paddingRight: 8 },
  colQty: { width: 50, textAlign: "right" },
  colUnit: { width: 80, textAlign: "right" },
  colTotal: { width: 90, textAlign: "right" },
  totals: {
    alignSelf: "flex-end",
    width: 240,
    marginTop: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: INK,
    marginTop: 4,
    paddingTop: 6,
  },
  grandText: {
    fontSize: 12,
    fontWeight: 700,
  },
  taxNote: {
    marginTop: 16,
    fontSize: 8.5,
    color: MUTED,
  },
  note: {
    marginTop: 10,
    fontSize: 9.5,
  },
  payHeading: {
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: MUTED,
    marginTop: 26,
    marginBottom: 8,
  },
  payGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  payCard: {
    flexGrow: 1,
    flexBasis: "46%",
    borderWidth: 0.5,
    borderColor: HAIR,
    borderRadius: 4,
    padding: 10,
  },
  payTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  paySub: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 6,
  },
  payRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  payLabel: {
    width: 108,
    fontSize: 8,
    color: MUTED,
    paddingTop: 0.5,
    paddingRight: 6,
  },
  payValue: {
    flex: 1,
    fontSize: 8.5,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export function InvoicePdf({
  spec,
  profiles,
}: {
  spec: InvoiceSpec;
  profiles: PaymentProfile[];
}) {
  const cur = spec.currency;
  const hasQty = spec.lines.some((l) => l.qty != null);
  const note = taxNote(spec.taxMode);

  return (
    <Document
      title={`${spec.number} — ${spec.billTo.name} — ${issuer.name}`}
      author={issuer.name}
      subject={`Invoice ${spec.number}`}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>INVOICE</Text>
        <View style={styles.titleRule} />

        <View style={styles.topRow}>
          <View style={{ maxWidth: "48%" }}>
            <Text style={styles.billToLabel}>Bill to</Text>
            <Text style={styles.billToName}>{spec.billTo.name}</Text>
            {(spec.billTo.lines ?? []).map((l, i) => (
              <Text key={i} style={styles.billToLine}>
                {l}
              </Text>
            ))}
          </View>
          <View style={styles.issuerBlock}>
            <Text style={styles.issuerName}>{issuer.name}</Text>
            <Text style={styles.issuerLine}>{issuer.email}</Text>
            {issuer.addressLines.map((l, i) => (
              <Text key={i} style={styles.issuerLine}>
                {l}
              </Text>
            ))}
            <Text style={styles.issuerLine}>{issuer.phone}</Text>
            <Text style={[styles.issuerLine, { color: INK, fontWeight: 700 }]}>
              {issuer.vatId}
            </Text>
          </View>
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice No.</Text>
            <Text>{spec.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice Date</Text>
            <Text>{formatDate(spec.issuedAt, cur)}</Text>
          </View>
          {spec.serviceDate ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Service Date</Text>
              <Text>{formatDate(spec.serviceDate, cur)}</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={{ fontWeight: 700 }}>
              {formatDate(spec.dueAt, cur)}
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colDesc]}>Description of work</Text>
          {hasQty ? (
            <>
              <Text style={[styles.th, styles.colQty]}>Qty</Text>
              <Text style={[styles.th, styles.colUnit]}>Unit price</Text>
            </>
          ) : null}
          <Text style={[styles.th, styles.colTotal]}>Total</Text>
        </View>
        {spec.lines.map((line, i) => (
          <View key={i} style={styles.tr} wrap={false}>
            <Text style={styles.colDesc}>{line.description}</Text>
            {hasQty ? (
              <>
                <Text style={styles.colQty}>{line.qty ?? ""}</Text>
                <Text style={styles.colUnit}>
                  {line.unitPrice != null
                    ? formatMoney(line.unitPrice, cur)
                    : ""}
                </Text>
              </>
            ) : null}
            <Text style={styles.colTotal}>
              {formatMoney(lineAmount(line), cur)}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: 700 }}>Subtotal</Text>
            <Text>{formatMoney(subtotal(spec), cur)}</Text>
          </View>
          {spec.taxMode === "de-19" ? (
            <View style={styles.totalRow}>
              <Text style={{ fontWeight: 700 }}>MwSt. (19%)</Text>
              <Text>{formatMoney(taxAmount(spec), cur)}</Text>
            </View>
          ) : null}
          <View style={styles.grandRow}>
            <Text style={styles.grandText}>Grand Total</Text>
            <Text style={styles.grandText}>
              {formatMoney(grandTotal(spec), cur)}
            </Text>
          </View>
        </View>

        {note ? <Text style={styles.taxNote}>{note}</Text> : null}
        {spec.note ? <Text style={styles.note}>{spec.note}</Text> : null}

        {profiles.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.payHeading}>Payment details</Text>
            <View style={styles.payGrid}>
              {profiles.map((p, i) => (
                <View key={i} style={styles.payCard}>
                  <Text style={styles.payTitle}>{p.heading}</Text>
                  {p.subheading ? (
                    <Text style={styles.paySub}>{p.subheading}</Text>
                  ) : null}
                  {p.rows.map(([label, value], j) => (
                    <View key={j} style={styles.payRow}>
                      <Text style={styles.payLabel}>{label}</Text>
                      <Text style={styles.payValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${spec.number} · ${issuer.name} · Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  spec: InvoiceSpec,
  profiles: PaymentProfile[],
): Promise<Buffer> {
  return renderToBuffer(<InvoicePdf spec={spec} profiles={profiles} />);
}
