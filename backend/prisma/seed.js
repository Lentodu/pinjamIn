const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const items = [
  {
    name: "Laptop ASUS VivoBook",
    category: "Elektronik",
    description: "Laptop untuk presentasi, praktikum, dan kerja kelompok",
    photo: null,
    stock: 8,
    status: "tersedia",
  },
  {
    name: "Proyektor Epson EB-X06",
    category: "Elektronik",
    description: "Proyektor untuk presentasi di ruang kelas",
    photo: null,
    stock: 5,
    status: "tersedia",
  },
  {
    name: "Layar Proyektor Portable",
    category: "Elektronik",
    description: "Layar proyektor lipat ukuran 70 inci",
    photo: null,
    stock: 3,
    status: "tersedia",
  },
  {
    name: "Speaker Portable",
    category: "Audio",
    description: "Speaker aktif untuk seminar dan kegiatan kampus",
    photo: null,
    stock: 4,
    status: "tersedia",
  },
  {
    name: "Microphone Wireless",
    category: "Audio",
    description: "Microphone wireless untuk presentasi atau acara",
    photo: null,
    stock: 6,
    status: "tersedia",
  },
  {
    name: "Kamera DSLR Canon EOS 200D",
    category: "Multimedia",
    description: "Kamera untuk dokumentasi kegiatan kampus",
    photo: null,
    stock: 2,
    status: "dipinjam",
  },
  {
    name: "Tripod Kamera",
    category: "Multimedia",
    description: "Tripod aluminium untuk kamera DSLR atau smartphone",
    photo: null,
    stock: 8,
    status: "tersedia",
  },
  {
    name: "Kabel HDMI",
    category: "Aksesoris",
    description: "Kabel HDMI sepanjang 5 meter",
    photo: null,
    stock: 15,
    status: "tersedia",
  },
  {
    name: "Extension Kabel Roll",
    category: "Aksesoris",
    description: "Kabel roll 10 meter untuk kebutuhan acara",
    photo: null,
    stock: 10,
    status: "tersedia",
  },
  {
    name: "Pointer Presentasi",
    category: "Aksesoris",
    description: "Wireless presenter dengan laser pointer",
    photo: null,
    stock: 7,
    status: "tersedia",
  },
  {
    name: "Mikroskop Binokuler",
    category: "Laboratorium",
    description: "Mikroskop untuk praktikum biologi",
    photo: null,
    stock: 12,
    status: "tersedia",
  },
  {
    name: "Multimeter Digital",
    category: "Laboratorium",
    description: "Alat ukur tegangan, arus, dan resistansi",
    photo: null,
    stock: 15,
    status: "dipinjam",
  },
  {
    name: "Osiloskop Digital",
    category: "Laboratorium",
    description: "Osiloskop untuk praktikum elektronika",
    photo: null,
    stock: 4,
    status: "tersedia",
  },
  {
    name: "Power Supply DC",
    category: "Laboratorium",
    description: "Power supply variabel untuk praktikum",
    photo: null,
    stock: 6,
    status: "tersedia",
  },
  {
    name: "Toolkit Elektronika",
    category: "Laboratorium",
    description: "Set obeng, tang, dan alat servis elektronika",
    photo: null,
    stock: 10,
    status: "tersedia",
  },
  {
    name: "Kursi Lipat",
    category: "Furnitur",
    description: "Kursi lipat untuk seminar dan acara kampus",
    photo: null,
    stock: 80,
    status: "tersedia",
  },
  {
    name: "Meja Lipat",
    category: "Furnitur",
    description: "Meja portable untuk kegiatan kampus",
    photo: null,
    stock: 30,
    status: "tersedia",
  },
  {
    name: "Tenda Lipat 3x3",
    category: "Perlengkapan Acara",
    description: "Tenda portable untuk bazar atau kegiatan outdoor",
    photo: null,
    stock: 5,
    status: "tersedia",
  },
  {
    name: "Whiteboard Portable",
    category: "Perlengkapan Kelas",
    description: "Papan tulis portable dengan roda",
    photo: null,
    stock: 4,
    status: "tersedia",
  },
  {
    name: "Mesin Absensi Fingerprint",
    category: "Elektronik",
    description: "Digunakan untuk kebutuhan acara atau pelatihan",
    photo: null,
    stock: 2,
    status: "rusak",
  },
];

async function main() {
  console.log("Mulai seeding data items...");

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  console.log(`Berhasil menambahkan ${items.length} data items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });