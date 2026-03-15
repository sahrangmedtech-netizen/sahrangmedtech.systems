import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function getArg(flag, fallback = '') {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

function normalizeId(value) {
  return String(value || '').trim().toUpperCase();
}

async function main() {
  const verificationId = normalizeId(getArg('--id'));
  const domain = String(getArg('--domain', 'https://sahrangmedtech.systems')).replace(/\/$/, '');
  const outputDir = getArg('--out', path.join(process.cwd(), 'assets', 'verification-qr'));
  const recordsPath = getArg('--records', path.join(process.cwd(), 'data', 'verification-records.json'));
  const shouldGenerateAll = process.argv.includes('--all');

  const ids = await resolveVerificationIds({
    verificationId,
    shouldGenerateAll,
    recordsPath
  });

  if (!ids.length) {
    throw new Error('No verification IDs found to generate QR codes.');
  }

  await mkdir(outputDir, { recursive: true });

  for (const id of ids) {
    await generateSingleQr({ verificationId: id, domain, outputDir });
  }

  console.log(`Generated ${ids.length} QR code(s) in: ${outputDir}`);
}

async function resolveVerificationIds({ verificationId, shouldGenerateAll, recordsPath }) {
  if (verificationId) {
    return [verificationId];
  }

  if (!shouldGenerateAll) {
    throw new Error('Missing --id or --all. Example: node tools/generate-verification-qr.mjs --all');
  }

  const raw = await readFile(recordsPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Verification records file must contain a JSON array.');
  }

  return parsed
    .map((entry) => normalizeId(entry && entry.verificationId))
    .filter((id) => !!id);
}

async function generateSingleQr({ verificationId, domain, outputDir }) {
  const verifyUrl = `${domain}/verify-completion.html?id=${encodeURIComponent(verificationId)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&format=png&data=${encodeURIComponent(verifyUrl)}`;

  const response = await fetch(qrApiUrl);
  if (!response.ok) {
    throw new Error(`QR generation failed (${response.status})`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  const imagePath = path.join(outputDir, `${verificationId}.png`);
  const metaPath = path.join(outputDir, `${verificationId}.json`);

  await writeFile(imagePath, imageBuffer);
  await writeFile(metaPath, JSON.stringify({ verificationId, verifyUrl, generatedAt: new Date().toISOString() }, null, 2));

  console.log(`QR image: ${imagePath}`);
  console.log(`Metadata: ${metaPath}`);
  console.log(`Verify URL: ${verifyUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
