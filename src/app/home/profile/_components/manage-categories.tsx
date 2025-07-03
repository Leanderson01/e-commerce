"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function ManageCategories() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Get categories
  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = api.category.list.getCategories.useQuery({
    limit: 100,
    offset: 0,
  });

  // Delete category mutation
  const deleteCategory = api.category.form.deleteCategory.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Category deleted successfully!");
        void refetch();
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        toast.error(response.error?.message ?? "Failed to delete category");
      }
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete category");
    },
  });

  // Filter categories based on search term
  const filteredCategories =
    categoriesResponse?.success && categoriesResponse.data
      ? categoriesResponse.data.categories.filter((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : [];

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate({ id: categoryToDelete });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Section */}
      <div className="flex items-center justify-end space-x-4">
        <div className="max-w-56 flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <Button
          className="h-10 w-10 p-0"
          onClick={() => router.push("/home/profile/admin/categories/create")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  {searchTerm
                    ? "No categories found matching your search."
                    : "No categories available."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono text-sm">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {category.description ?? "No description"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(
                            `/home/profile/admin/categories/edit/${category.id}`,
                          );
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(category.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone and may affect products associated with this category.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={deleteCategory.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteCategory.isPending}
              className="w-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteCategory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
