import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import { HomeInformation } from "@/components/home-information";
export default function Preview() { return <AppShell preview><Dashboard preview><HomeInformation/></Dashboard></AppShell>; }
