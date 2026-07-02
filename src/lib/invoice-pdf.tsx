import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  type InvoiceSpec,
  type PaymentProfile,
  lineAmount,
  subtotal,
  taxAmount,
  grandTotal,
  taxNote,
  formatMoney,
  formatMoneyCompact,
  formatDate,
} from "./invoice";
import { issuer } from "@/content/invoices/config";

/**
 * Layout modeled on a Wise-generated invoice (INV-26013): logo + "Invoice"
 * wordmark, number/date top right, Billed to / Issued by columns, a bold
 * "<amount> due by <date>" headline, bold VAT/crypto notes, the
 * quantity/unit-price/tax table, Amount Due, and a "Ways to pay" section
 * with side-by-side bank-detail columns.
 *
 * Built-in fonts only (see agreement-pdf.tsx): remote font fetches
 * silently fail on cold starts and tank the render.
 */
const SANS = "Helvetica";

const INK = "#111111";
const MUTED = "#6f6f6f";
const HAIR = "#e3e3e3";
const RULE = "#111111";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
    fontFamily: SANS,
    fontSize: 9,
    lineHeight: 1.45,
    color: INK,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: 700,
  },
  headerMeta: {
    flexDirection: "row",
    gap: 28,
  },
  headerMetaLabel: {
    fontSize: 8.5,
    color: MUTED,
    marginBottom: 3,
  },
  headerMetaValue: {
    fontSize: 9,
  },
  partiesRow: {
    flexDirection: "row",
    borderTopWidth: 0.75,
    borderTopColor: HAIR,
    paddingTop: 14,
    marginBottom: 30,
  },
  party: {
    width: "50%",
    paddingRight: 24,
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 5,
  },
  partyLine: {
    fontSize: 9,
    color: "#3d3d3d",
  },
  dueHeadline: {
    fontSize: 19,
    fontWeight: 700,
    marginBottom: 12,
  },
  boldNote: {
    fontSize: 8.5,
    fontWeight: 700,
    marginBottom: 4,
    maxWidth: 420,
  },
  plainNote: {
    fontSize: 8.5,
    color: "#3d3d3d",
    marginTop: 4,
    maxWidth: 420,
  },
  table: {
    marginTop: 26,
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingBottom: 6,
  },
  th: {
    fontSize: 9,
    fontWeight: 700,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 9,
    borderBottomWidth: 0.75,
    borderBottomColor: HAIR,
  },
  colDesc: { flex: 1, paddingRight: 10 },
  colQty: { width: 58 },
  colUnit: { width: 78 },
  colTax: { width: 52 },
  colTotal: { width: 88, textAlign: "right" },
  totalsBlock: {
    alignSelf: "flex-end",
    width: 250,
    marginTop: 12,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#3d3d3d",
  },
  amountDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: RULE,
    marginTop: 6,
    paddingTop: 8,
  },
  amountDueText: {
    fontSize: 11.5,
    fontWeight: 700,
  },
  waysHeading: {
    fontSize: 10.5,
    fontWeight: 700,
    marginTop: 34,
    paddingBottom: 7,
    borderBottomWidth: 0.75,
    borderBottomColor: HAIR,
    marginBottom: 12,
  },
  waysRow: {
    flexDirection: "row",
    gap: 24,
  },
  waysCol: {
    flex: 1,
  },
  waysTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3,
  },
  waysSub: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 9,
  },
  waysItemRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  waysLabel: {
    width: 92,
    fontSize: 8,
    color: MUTED,
    paddingRight: 8,
  },
  waysValue: {
    flex: 1,
    fontSize: 8.5,
  },
});

function noteLine(p: PaymentProfile): string {
  const values = p.rows.map(([, v]) => v).join(", ");
  return `${p.heading}${p.subheading ? ` - ${p.subheading}` : ""}: ${values}`;
}

export function InvoicePdf({
  spec,
  profiles,
}: {
  spec: InvoiceSpec;
  profiles: PaymentProfile[];
}) {
  const cur = spec.currency;
  const cards = profiles.filter((p) => (p.placement ?? "card") === "card");
  const notes = profiles.filter((p) => p.placement === "note");
  const vatNote = taxNote(spec.taxMode);
  const logoAbs = issuer.logoPath
    ? resolve(process.cwd(), issuer.logoPath)
    : null;
  const logo = logoAbs && existsSync(logoAbs) ? logoAbs : null;

  return (
    <Document
      title={`${spec.number} — ${spec.billTo.name} — ${issuer.name}`}
      author={issuer.name}
      subject={`Invoice ${spec.number}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {logo ? <Image src={logo} style={styles.logo} /> : null}
            <Text style={styles.wordmark}>Invoice</Text>
          </View>
          <View style={styles.headerMeta}>
            <View>
              <Text style={styles.headerMetaLabel}>Invoice number</Text>
              <Text style={styles.headerMetaValue}>{spec.number}</Text>
            </View>
            <View>
              <Text style={styles.headerMetaLabel}>Issue date</Text>
              <Text style={styles.headerMetaValue}>
                {formatDate(spec.issuedAt)}
              </Text>
            </View>
            {spec.serviceDate ? (
              <View>
                <Text style={styles.headerMetaLabel}>Service date</Text>
                <Text style={styles.headerMetaValue}>
                  {formatDate(spec.serviceDate)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Billed to</Text>
            <Text style={styles.partyLine}>{spec.billTo.name}</Text>
            {(spec.billTo.lines ?? []).map((l, i) => (
              <Text key={i} style={styles.partyLine}>
                {l}
              </Text>
            ))}
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Issued by</Text>
            <Text style={styles.partyLine}>{issuer.name}</Text>
            {issuer.addressLines.map((l, i) => (
              <Text key={i} style={styles.partyLine}>
                {l}
              </Text>
            ))}
            <Text style={styles.partyLine}>{issuer.email}</Text>
            <Text style={styles.partyLine}>{issuer.phone}</Text>
          </View>
        </View>

        <Text style={styles.dueHeadline}>
          {formatMoneyCompact(grandTotal(spec), cur)} due by{" "}
          {formatDate(spec.dueAt)}
        </Text>

        <Text style={styles.boldNote}>
          {issuer.vatId}
          {vatNote ? ` *${vatNote}` : ""}
        </Text>
        {notes.map((p, i) => (
          <Text key={i} style={styles.boldNote}>
            {noteLine(p)}
          </Text>
        ))}
        {spec.note ? <Text style={styles.plainNote}>{spec.note}</Text> : null}

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colDesc]}>Product or service</Text>
            <Text style={[styles.th, styles.colQty]}>Quantity</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit price</Text>
            <Text style={[styles.th, styles.colTax]}>Tax</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {spec.lines.map((line, i) => (
            <View key={i} style={styles.tr} wrap={false}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.qty ?? 1}</Text>
              <Text style={styles.colUnit}>
                {formatMoneyCompact(
                  line.unitPrice ?? lineAmount(line) / (line.qty ?? 1),
                  cur,
                )}
              </Text>
              <Text style={styles.colTax}>
                {spec.taxMode === "de-19" ? "19%" : ""}
              </Text>
              <Text style={styles.colTotal}>
                {formatMoney(lineAmount(line), cur)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total excluding tax</Text>
            <Text>{formatMoney(subtotal(spec), cur)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              {spec.taxMode === "de-19" ? "Total tax (19% MwSt.)" : "Total tax"}
            </Text>
            <Text>{formatMoney(taxAmount(spec), cur)}</Text>
          </View>
          <View style={styles.amountDueRow}>
            <Text style={styles.amountDueText}>Amount Due</Text>
            <Text style={styles.amountDueText}>
              {formatMoney(grandTotal(spec), cur)}
            </Text>
          </View>
        </View>

        {cards.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.waysHeading}>Ways to pay</Text>
            <View style={styles.waysRow}>
              {cards.map((p, i) => (
                <View key={i} style={styles.waysCol}>
                  <Text style={styles.waysTitle}>{p.heading}</Text>
                  {p.subheading ? (
                    <Text style={styles.waysSub}>{p.subheading}</Text>
                  ) : null}
                  <View style={styles.waysItemRow}>
                    <Text style={styles.waysLabel}>Reference</Text>
                    <Text style={styles.waysValue}>{spec.number}</Text>
                  </View>
                  {p.rows.map(([label, value], j) => (
                    <View key={j} style={styles.waysItemRow}>
                      <Text style={styles.waysLabel}>{label}</Text>
                      <Text style={styles.waysValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ) : null}
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
