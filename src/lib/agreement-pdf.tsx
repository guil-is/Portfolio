import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { JusticeClient, SowSection } from "@/content/clients/justice";
import type { SignedAgreement } from "@/lib/signed-agreement";

/**
 * Uses only @react-pdf/renderer's built-in fonts (Helvetica, Times-Roman,
 * Courier) so the renderer never has to fetch anything at runtime —
 * remote font fetches silently fail on Vercel cold starts and tank the
 * entire render.
 */
const SERIF = "Times-Roman";
const SANS = "Helvetica";
const MONO = "Courier";

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 64,
    fontFamily: SERIF,
    fontSize: 11,
    lineHeight: 1.55,
    color: "#0a0a0a",
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#7e7e7e",
    fontFamily: SANS,
    fontWeight: 600,
  },
  title: {
    fontSize: 22,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: 600,
  },
  subtle: {
    color: "#555",
    fontSize: 10,
    marginBottom: 24,
  },
  preamble: {
    fontStyle: "italic",
    marginBottom: 24,
    fontSize: 11.5,
    lineHeight: 1.6,
  },
  rule: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#d4d4d4",
    marginVertical: 16,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  metaCell: {
    width: "50%",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7e7e7e",
    fontFamily: SANS,
    fontWeight: 600,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: SANS,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 10,
  },
  bulletText: {
    flex: 1,
  },
  kvRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  kvKey: {
    width: "32%",
    color: "#555",
  },
  kvValue: {
    flex: 1,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
    fontFamily: SANS,
  },
  certBody: {
    marginTop: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#0a0a0a",
    borderRadius: 4,
  },
  certRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  certLabel: {
    width: "28%",
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7e7e7e",
    fontFamily: SANS,
    fontWeight: 600,
    paddingTop: 2,
  },
  certValue: {
    flex: 1,
    fontSize: 11,
  },
  certMono: {
    flex: 1,
    fontSize: 8.5,
    fontFamily: MONO,
    color: "#333",
  },
  ackHeading: {
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7e7e7e",
    fontFamily: SANS,
    fontWeight: 600,
    marginTop: 14,
    marginBottom: 6,
  },
  ackItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  ackCheck: {
    width: 14,
    fontSize: 11,
  },
  ackText: {
    flex: 1,
    fontSize: 10.5,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 64,
    right: 64,
    fontSize: 8,
    color: "#7e7e7e",
    fontFamily: SANS,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

function SowBlocks({ section }: { section: SowSection }) {
  return (
    <View wrap>
      <Text style={styles.sectionHeading}>{section.heading}</Text>
      {section.blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <Text key={i} style={styles.paragraph}>
              {block.text}
            </Text>
          );
        }
        if (block.type === "ul") {
          return (
            <View key={i} style={{ marginBottom: 8 }}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key={i} style={{ marginBottom: 8 }}>
            {block.rows.map(([k, v], j) => (
              <View key={j} style={styles.kvRow}>
                <Text style={styles.kvKey}>{k}</Text>
                <Text style={styles.kvValue}>{v}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export function AgreementPdf({
  client,
  signature,
}: {
  client: JusticeClient;
  signature: SignedAgreement;
}) {
  const { sow, engagement } = client;
  const signedAtReadable = new Date(signature.signedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return (
    <Document
      title={`Statement of Work — ${client.clientName} × Guil Maueler`}
      author="Guilherme Maueler"
      subject={`Signed SOW, version ${sow.version}`}
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.eyebrow}>
          Statement of Work · Effective {sow.effectiveDate}
        </Text>
        <Text style={styles.title}>
          {client.clientName} × Guilherme Maueler
        </Text>
        <Text style={styles.subtle}>Version {sow.version}</Text>

        <Text style={styles.preamble}>{sow.preamble}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Rate</Text>
            <Text style={styles.metaValue}>${engagement.rateUsd} / hr</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Weekly</Text>
            <Text style={styles.metaValue}>
              {engagement.weeklyHoursMin}–{engagement.weeklyHoursMax} h
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Start</Text>
            <Text style={styles.metaValue}>{engagement.startDate}</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {sow.sections.map((s) => (
          <SowBlocks key={s.heading} section={s} />
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${client.clientName} × Guilherme Maueler · SOW ${sow.version} · Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.eyebrow}>Electronic Signature Certificate</Text>
        <Text style={styles.certTitle}>This agreement has been signed.</Text>
        <Text style={styles.subtle}>
          The following is a record of the electronic signature applied to the
          Statement of Work above.
        </Text>

        <View style={styles.certBody}>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Signed by</Text>
            <Text style={styles.certValue}>{signature.signerName}</Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Email</Text>
            <Text style={styles.certValue}>{signature.signerEmail}</Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Signed at</Text>
            <Text style={styles.certValue}>{signedAtReadable} UTC</Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Document version</Text>
            <Text style={styles.certValue}>{signature.documentVersion}</Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certLabel}>Document hash</Text>
            <Text style={styles.certMono}>{signature.documentHash}</Text>
          </View>
          {signature.ipAddress ? (
            <View style={styles.certRow}>
              <Text style={styles.certLabel}>IP address</Text>
              <Text style={styles.certValue}>{signature.ipAddress}</Text>
            </View>
          ) : null}
          {signature.userAgent ? (
            <View style={styles.certRow}>
              <Text style={styles.certLabel}>User agent</Text>
              <Text style={[styles.certMono, { fontSize: 7.5 }]}>
                {signature.userAgent}
              </Text>
            </View>
          ) : null}
        </View>

        {signature.acknowledgments && signature.acknowledgments.length > 0 ? (
          <>
            <Text style={styles.ackHeading}>Confirmed acknowledgments</Text>
            {signature.acknowledgments.map((a, i) => (
              <View key={i} style={styles.ackItem}>
                <Text style={styles.ackCheck}>✓</Text>
                <Text style={styles.ackText}>{a}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${client.clientName} × Guilherme Maueler · SOW ${sow.version} · Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

export async function renderAgreementPdf(
  client: JusticeClient,
  signature: SignedAgreement,
): Promise<Buffer> {
  return renderToBuffer(<AgreementPdf client={client} signature={signature} />);
}
