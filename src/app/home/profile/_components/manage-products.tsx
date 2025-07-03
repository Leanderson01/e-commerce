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

export function ManageProducts() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Get products
  const {
    data: productsResponse,
    isLoading,
    refetch,
  } = api.product.list.getProducts.useQuery({
    limit: 100,
    offset: 0,
    inStock: false, // Show all products, not just in stock
  });

  // Delete product mutation
  const deleteProduct = api.product.form.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      void refetch();
      setDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete product");
    },
  });

  // Filter products based on search term
  const filteredProducts = productsResponse?.products
    ? productsResponse.products.filter(
        (product) =>
          (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())) ??
          product._category?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : [];

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct.mutate({ id: productToDelete });
    }
  };

  // Format price in USD currency
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
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
          onClick={() => {
            router.push("/home/profile/admin/products/create");
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-24">Stock</TableHead>
              <TableHead className="w-28">Price</TableHead>
              <TableHead className="max-w-xs">Description</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  {searchTerm
                    ? "No products found matching your search."
                    : "No products available."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {product._category?.name ?? "No category"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start space-y-1">
                      <span className="text-sm font-medium">
                        {product.stockQuantity ?? 0} units
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                    {product.description ?? "No description"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(
                            `/home/profile/admin/products/edit/${product.id}`,
                          );
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(product.id)}
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
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone and may affect orders and cart items associated with
              this product.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setProductToDelete(null);
              }}
              disabled={deleteProduct.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteProduct.isPending}
              className="w-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
