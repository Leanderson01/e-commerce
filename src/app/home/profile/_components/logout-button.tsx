"use client";

import { Button } from "~/components/ui/button";
import { LogOut, Loader2, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function LogoutButton() {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const logout = api.auth.form.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully!");
      router.push("/auth/login");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to logout");
    },
  });

  const deleteAccount = api.auth.form.deleteUserAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully!");
      setIsDeleteModalOpen(false);
      router.push("/auth/login");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  const handleLogout = () => {
    logout.mutate();
  };

  const handleDeleteAccount = () => {
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    deleteAccount.mutate({ password });
  };

  const handleOpenDeleteModal = () => {
    setPassword("");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setPassword("");
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleLogout}
        disabled={logout.isPending}
        variant="outline"
        className="h-12 w-full rounded-md border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:focus:ring-red-400"
      >
        {logout.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </>
        )}
      </Button>

      <Button
        onClick={handleOpenDeleteModal}
        disabled={deleteAccount.isPending}
        className="h-12 w-full rounded-md bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-400"
      >
        {deleteAccount.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Account
          </>
        )}
      </Button>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? This
              action cannot be undone. All your data will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Enter your password to confirm
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={deleteAccount.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending || !password.trim()}
              className="w-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
