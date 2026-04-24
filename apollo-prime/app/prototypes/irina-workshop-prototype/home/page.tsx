"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@uipath/apollo-wind/components/ui/card";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Label } from "@uipath/apollo-wind/components/ui/label";
import { AppHeader } from "@/components/custom/app-header";
import { Bot, Code, FileCode2, ArrowLeft } from "lucide-react";

const appTypes = [
  {
    id: "rpa-app",
    title: "RPA App",
    description:
      "Build an automation using the visual designer with drag-and-drop activities.",
    icon: Bot,
  },
  {
    id: "js-app",
    title: "JS App",
    description:
      "Create a web application with JavaScript, HTML, and CSS using the built-in editor.",
    icon: FileCode2,
  },
  {
    id: "coded-app",
    title: "Coded App",
    description:
      "Write automation logic in code with full IntelliSense and debugging support.",
    icon: Code,
  },
];

export default function IrinaWorkshopPrototypeHomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader productName="Studio Web" autopilot={false} />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 overflow-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a new app
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the type of app you want to build.
          </p>
        </div>

        {/* App type selection cards */}
        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {appTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selected === type.id;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : ""
                }`}
                onClick={() => setSelected(type.id)}
              >
                <CardHeader className="items-center text-center">
                  <div
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-sm">{type.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {type.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Project name input — appears after selecting an app type */}
        {selected && (
          <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="My new project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              router.push("/prototypes/irina-workshop-prototype")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button disabled={!selected || !projectName.trim()}>
            Create App
          </Button>
        </div>
      </main>
    </div>
  );
}
