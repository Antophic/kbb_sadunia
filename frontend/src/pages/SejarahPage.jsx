import { useLang } from "../context/LangContext";

export default function SejarahPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.sejarah")}</h1>
        <div className="bg-white border border-surface-200 p-6 prose-article">
          <h2>1. Sejarah Kerukunan Bubuhan Banjar Sa-dunia</h2>
          
          <h3>Latar-Belakang</h3>
          <p>
            Paguyuban Kerukunan Bubuhan Banjar Sadunia (KBBS) lahir dari kebutuhan untuk menjaga dan mempererat persaudaraan, kebersamaan, serta identitas budaya masyarakat Banjar yang tersebar di berbagai daerah dan negara seluruh dunia. Perlu diketahui suku bangsa Banjar ini termasuk suku asli Kalimantan yang memiliki reputasi dan semangat merantau. Bahkan temuan riset DNA tahun 2000, bahwa perantauan suku Banjar sampai ke Madagaskar sejak abad ke-6.
          </p>

          <h3>Cikal Bakal Pembentukan</h3>
          <p>
            KBBS didirikan sebagai wadah komunikasi, koordinasi, dan solidaritas antarperantau Banjar (bubuhan Banjar) yang hidup di luar Kalimantan Selatan, baik di wilayah Indonesia lainnya maupun di luar negeri. Organisasi ini bertujuan menjaga rasa kebersamaan serta melestarikan adat dan budaya Banjar di perantauan, menguatkan ke-Indonesiaan, Kebhinekaan dengan prinsip dimana bumi dipijak disitu langit dijunjung. Lebih dari itu bertekad turut membangun daerah dimana Masyarakat Banjar berada tumbuh dan berkembang.
          </p>
          <p>
            Cikal bakal keberadaan paguyuban suku Banjar ini diinisiasi oleh Gubernur HM Sjachril Darham kala itu yang mengundang orang-orang Banjar perantauan Malaysia, Brunei dan seluruh Indonesia dalam sebuah hajatan yang dikenal dengan ARUH GANAL tahun 2000-an. Ada inisiatif tokoh-tokoh Banjar perantauan yang ingin menjaga kerukunan dan memfasilitasi berbagai kegiatan sosial budaya lewat organisasi resmi.
          </p>

          <h3>Periode Pembentukan</h3>
          <p>
            Paguyuban suku Banjar ini mulai terbentuk secara formal pada masa Gubernur H Rudy Arifin dengan ditandai adanya Kongres Budaya Banjar 1 tahun 2007. Kongres ini menghasilkan rekomendasi peleburan berbagai organisasi dan paguyuban suku Banjar di Indonesia. Kemudian semakin menguat pada Kongres KBB II (2010), Kongres KBB III (2013) dengan Akta Notaris AHU-0062110.AH.01.07 Tahun 2016, Kongres KBB IV (2019) dan Kongres KBB V dan Kongres Bubuhan Banjar I (2022) yang ditandai peralihan kepemimpinan oleh Gubernur H Sahbirin Noor secara resmi dikukuhkan pada 22 Januari 2023 dengan Akta Notaris AHU-0001263.AH.01.08 Tahun 2024.
          </p>

          <h2>2. Dinamika Organisasi</h2>
          <p>
            Seiring waktu, organisasi KBB Sadunia terus bertambah secara formal dengan terbentuknya di Provinsi-provinsi, Kota/Kabupaten bahkan sampai kecamatan yang diikuti dengan organisasi otonom seperti Ikatan Pemuda Banjar, Ikatan Perempuan Banjar dan lainnya sesuai kebutuhan masing-masing daerah. Sejak tahun 2023 telah terbentuk PW Luar Negeri KBB Saudi Arabia, PW LN Kuwait, dan PW LN Taiwan serta Pertubuhan Banjar Malaysia, Brunei dan Singapura sebanyak 25 PW KBB se-Indonesia dan sa-dunia.
          </p>
          <p>
            KBB Sadunia rutin mengadakan pertemuan, pengajian, pelestarian budaya Banjar adat istiadat seni tradisional dan kuliner, serta berbagai kegiatan sosial kemasyarakatan dan ekonomi untuk memperkuat ikatan sosial antar anggota.
          </p>
          <p>
            Sejak disahkan AD/ART pada Kongres Bubuhan Banjar (KBB I) tahun 2022, KBB Sadunia membentuk kepengurusan di pusat yakni PDK atau Pengurus Daerah Khusus Kab/kota di Provinsi Kalsel. Tujuannya untuk menguatkan peran aktif silaturahmi dan menjadi agensi tamu-tamu kerabat Kulaan Banjar dari luar provinsi dan luar negeri. KBB Sadunia juga berperan aktif dalam membantu anggota yang mengalami kesulitan di perantauan, termasuk pendampingan hukum, pendidikan anak, dan bantuan kemanusiaan.
          </p>
          
          <div className="bg-surface-50 p-4 border-l-4 border-primary-600 mt-6 mb-4 text-center">
            <p className="font-bold text-primary-800 uppercase tracking-widest m-0">
              BERGERAK BANJAR MENJEMPUT DUNIA, BANJAR RAKAT, MUFAKAT DAN BERMARTABAT
            </p>
            <p className="text-sm mt-2">
              Adaptasi terhadap perubahan zaman agar tetap relevan, berdaya guna dan berdaya saing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
