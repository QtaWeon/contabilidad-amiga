import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "✓ Cuenta creada", description: "Bienvenido al Sistema Contable." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "✓ Sesión iniciada", description: "Bienvenido de vuelta." });
      }
    } catch (error: any) {
      const msg = error.code === "auth/email-already-in-use" ? "Este correo ya está registrado."
        : error.code === "auth/wrong-password" || error.code === "auth/invalid-credential" ? "Credenciales incorrectas."
        : error.code === "auth/weak-password" ? "La contraseña debe tener al menos 6 caracteres."
        : error.code === "auth/invalid-email" ? "Correo electrónico inválido."
        : "Error al autenticar. Intenta de nuevo.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary rounded-2xl p-4">
              <BarChart3 className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Sistema Contable</h1>
          <p className="text-muted-foreground font-body text-sm">Bachillerato Técnico en Contabilidad</p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${!isRegister ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${isRegister ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-body">
            <div>
              <label className="text-sm font-medium text-foreground">Correo electrónico</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumno@escuela.edu" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading ? "Cargando..." : isRegister ? (
                <><UserPlus className="h-4 w-4 mr-2" /> Crear Cuenta</>
              ) : (
                <><LogIn className="h-4 w-4 mr-2" /> Entrar</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
