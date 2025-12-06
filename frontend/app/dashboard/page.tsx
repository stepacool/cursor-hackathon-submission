import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CreateOrganizationForm } from "@/components/forms/create-organization-form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getOrganizations } from "@/server/organizations";

export default async function Dashboard() {
  const organizations = await getOrganizations();
  const hasOrganizations = organizations.length > 0;

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between mt-10">
            <h2 className="text-2xl font-semibold">Your organizations</h2>
            <p className="text-sm text-base-content/60">
              {hasOrganizations
                ? "Select a workspace to continue."
                : "No organizations yet — create one to get started."}
            </p>
          </div>

          {hasOrganizations ? (
            <div className="grid gap-4 md:grid-cols-2">
              {organizations.map((organization) => (
                <Card
                  key={organization.id}
                  className="border-primary/10 bg-base-200/50 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <CardHeader className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{organization.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {organization.slug ? `/${organization.slug}` : "No slug set"}
                      </CardDescription>
                    </div>
                    <CardAction>
                      <span className="badge badge-outline badge-primary">Active ready</span>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between pt-2">
                    <p className="text-sm text-base-content/70">
                      Manage members, roles, and settings in this workspace.
                    </p>
                    <Button asChild variant="default" className="gap-2">
                      <Link href={`/dashboard/organization/${organization.slug}`}>
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-base-200/50">
              <CardHeader>
                <CardTitle>No organizations yet</CardTitle>
                <CardDescription>
                  Create your first workspace to invite members and manage access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg">Create organization</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Organization</DialogTitle>
                      <DialogDescription>
                        Name your workspace and start inviting teammates.
                      </DialogDescription>
                    </DialogHeader>
                    <CreateOrganizationForm />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
