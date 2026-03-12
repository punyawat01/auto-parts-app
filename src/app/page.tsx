import SearchForm from "@/components/SearchForm";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
      </div>

      <Navbar />

      <main className="w-full max-w-6xl px-4 flex flex-col gap-8 pb-16 z-0">
        <section className="text-center space-y-6 pt-16 md:pt-24 pb-8 md:pb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">ANG</span>
            <span className="text-primary font-black drop-shadow-md"> PRO</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
            ระบบค้นหาและจัดการอะไหล่รถยนต์ออนไลน์ที่ครอบคลุม ระบุรุ่นรถ ปี หรือรหัสอะไหล่เพื่อเริ่มค้นหา
          </p>
        </section>

        <section className="w-full relative">
          <SearchForm />
        </section>
      </main>
    </div>
  );
}
