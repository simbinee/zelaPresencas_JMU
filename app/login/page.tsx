import { Emblema } from "@/components/Emblema";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-12 text-parchment-50 lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-flame-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <Emblema className="h-8 w-8" />
          <span className="text-sm font-medium tracking-wide text-parchment-100/80">
            Juventude Metodista Unida · Maputo Norte
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-[1.15] text-white">
            O caminho até à envergadura conta-se presença a presença.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-parchment-100/70">
            Este sistema acompanha a assiduidade dos candidatos à envergadura
            e dos membros em pleno compromisso da Igreja Metodista Unida em
            Moçambique, evento a evento, até ao dia da cerimónia.
          </p>
        </div>

        <p className="relative text-xs text-parchment-100/40">
          JMU Maputo Norte — Sistema de Presenças
        </p>
      </div>

      <div className="flex items-center justify-center bg-parchment-50 px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Emblema className="h-8 w-8" />
            <span className="text-sm font-medium text-navy-900/70">
              JMU Maputo Norte
            </span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-navy-950">
            Iniciar sessão
          </h2>
          <p className="mt-1.5 mb-8 text-sm text-navy-950/55">
            Acede com as credenciais fornecidas pela coordenação.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
