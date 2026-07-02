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
 * "<amount> due by <date>" headline, the quantity/unit-price/tax table,
 * Amount Due, and a "Ways to pay" section with side-by-side columns.
 *
 * Invoices are kept to ONE page: with many line items the table and
 * section spacing condense automatically (see `density` below).
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
    paddingTop: 44,
    paddingBottom: 46,
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
    marginBottom: 26,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
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
    lineHeight: 1.15,
    marginBottom: 8,
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
    marginTop: 2,
    maxWidth: 420,
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
    borderBottomWidth: 0.75,
    borderBottomColor: HAIR,
  },
  colDesc: { flex: 1, paddingRight: 10 },
  colQty: { width: 50 },
  colUnit: { width: 70 },
  colTax: { width: 44 },
  colTotal: { width: 84, textAlign: "right" },
  totalsBlock: {
    alignSelf: "flex-end",
    width: 250,
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
    marginTop: 5,
    paddingTop: 7,
  },
  amountDueText: {
    fontSize: 11.5,
    fontWeight: 700,
  },
  waysHeading: {
    fontSize: 10.5,
    fontWeight: 700,
    paddingBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: HAIR,
    marginBottom: 10,
  },
  waysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 24,
    rowGap: 12,
  },
  waysCol: {
    flexGrow: 1,
    flexBasis: "44%",
  },
  waysTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 2,
  },
  waysSub: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 7,
  },
  waysItemRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  waysLabel: {
    width: 92,
    fontSize: 8,
    lineHeight: 1.3,
    color: MUTED,
    paddingRight: 8,
  },
  waysValue: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 52,
    right: 52,
    fontSize: 7.5,
    color: MUTED,
    textAlign: "center",
    letterSpacing: 0.3,
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
  const vatNote = taxNote(spec.taxMode);
  const logoAbs = issuer.logoPath
    ? resolve(process.cwd(), issuer.logoPath)
    : null;
  const logo = logoAbs && existsSync(logoAbs) ? logoAbs : null;

  // One-page guarantee: condense the table, section spacing, and the
  // ways-to-pay cards as the line count grows. ~6 items fit at full
  // comfort; ~10 compact; beyond that everything goes dense.
  const n = spec.lines.length;
  const density = n <= 6 ? "roomy" : n <= 9 ? "compact" : "dense";
  // The Tax column only earns its width when tax applies; hiding it
  // gives long descriptions room and avoids wrapped rows.
  const showTax = spec.taxMode === "de-19";
  const rowPad = { roomy: 9, compact: 4, dense: 3 }[density];
  const rowFont = { roomy: 9, compact: 8.5, dense: 8 }[density];
  const gap = { roomy: 26, compact: 14, dense: 10 }[density];
  const headerGap = { roomy: 26, compact: 18, dense: 12 }[density];
  const wayPad = { roomy: 4, compact: 3, dense: 2 }[density];

  return (
    <Document
      title={`${spec.number} — ${spec.billTo.name} — ${issuer.name}`}
      author={issuer.name}
      subject={`Invoice ${spec.number}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.headerRow, { marginBottom: headerGap }]}>
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

        <View style={[styles.partiesRow, { marginBottom: gap }]}>
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
            <Text style={styles.partyLine}>
              {issuer.email} · {issuer.phone}
            </Text>
            <Text style={styles.partyLine}>{issuer.vatId}</Text>
          </View>
        </View>

        <Text style={styles.dueHeadline}>
          {formatMoneyCompact(grandTotal(spec), cur)} due by{" "}
          {formatDate(spec.dueAt)}
        </Text>

        {vatNote ? <Text style={styles.boldNote}>{vatNote}</Text> : null}
        {spec.note ? <Text style={styles.plainNote}>{spec.note}</Text> : null}

        <View style={{ marginTop: gap }}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colDesc]}>Product or service</Text>
            <Text style={[styles.th, styles.colQty]}>Quantity</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit price</Text>
            {showTax ? <Text style={[styles.th, styles.colTax]}>Tax</Text> : null}
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {spec.lines.map((line, i) => (
            <View
              key={i}
              style={[
                styles.tr,
                { paddingVertical: rowPad, fontSize: rowFont },
              ]}
              wrap={false}
            >
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.qty ?? 1}</Text>
              <Text style={styles.colUnit}>
                {formatMoneyCompact(
                  line.unitPrice ?? lineAmount(line) / (line.qty ?? 1),
                  cur,
                )}
              </Text>
              {showTax ? <Text style={styles.colTax}>19%</Text> : null}
              <Text style={styles.colTotal}>
                {formatMoney(lineAmount(line), cur)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.totalsBlock, { marginTop: gap / 2 }]}>
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

        {profiles.length > 0 ? (
          <View wrap={false} style={{ marginTop: gap }}>
            <Text style={styles.waysHeading}>Ways to pay</Text>
            <View style={styles.waysRow}>
              {profiles.map((p, i) => (
                <View key={i} style={styles.waysCol}>
                  <Text style={styles.waysTitle}>{p.heading}</Text>
                  {density === "roomy" && p.subheading ? (
                    <Text style={styles.waysSub}>{p.subheading}</Text>
                  ) : null}
                  {p.includeReference !== false ? (
                    <View
                      style={[styles.waysItemRow, { marginBottom: wayPad }]}
                    >
                      <Text style={styles.waysLabel}>Reference</Text>
                      <Text style={styles.waysValue}>{spec.number}</Text>
                    </View>
                  ) : null}
                  {p.rows.map(([label, value], j) => (
                    <View
                      key={j}
                      style={[styles.waysItemRow, { marginBottom: wayPad }]}
                    >
                      <Text style={styles.waysLabel}>{label}</Text>
                      <Text style={styles.waysValue}>
                        {density === "roomy" ? value : value.replace(/\n/g, ", ")}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {spec.number} · {issuer.name} · {issuer.email}
        </Text>
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
