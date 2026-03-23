import { motion } from "framer-motion";

interface Props {
    email?: string;
}

export default function Footer({ email = "skyexplorer.feedback@gmail.com" }: Props) {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 w-full py-4 px-6 flex flex-col items-center gap-1"
        >
            <div className="flex items-center gap-1.5 font-body text-[11px] text-muted-foreground">
                <span>💬 Feedback or bug report?</span>
                <a
                    href={`mailto:${email}?subject=Sky Explorer AR – Feedback`}
                    className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                    {email}
                </a>
            </div>
            <span className="font-body text-[10px] text-muted-foreground/50">
                Sky Explorer AR © {new Date().getFullYear()}
            </span>
        </motion.footer>
    );
}
