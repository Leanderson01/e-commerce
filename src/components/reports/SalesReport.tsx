"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { api } from "~/trpc/react";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#bfbfbf",
  },
  tableCellHeader: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 8,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  summaryText: {
    fontSize: 12,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
});

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  _product?: {
    id: string;
    name: string;
    price: string;
    imageUrl?: string | null;
  } | null;
}

interface Order {
  id: string;
  orderDate: Date;
  totalAmount: string;
  _user?: {
    id: string;
    email: string;
    profile?: {
      fullName?: string | null;
    } | null;
  } | null;
  _items: OrderItem[];
}

interface SalesReportProps {
  orders: Order[];
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
}

const SalesReportDocument: React.FC<SalesReportProps> = ({
  orders,
  totalRevenue,
  totalOrders,
  totalProducts,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Sales Report</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.summaryText}>Report Summary:</Text>
        <Text style={styles.summaryText}>Total Orders: {totalOrders}</Text>
        <Text style={styles.summaryText}>
          Total Products Sold: {totalProducts}
        </Text>
        <Text style={styles.totalText}>
          Total Revenue: ${totalRevenue.toFixed(2)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Order Details:</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Order ID</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Customer</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>

          {orders.map((order) => (
            <View key={order.id} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {order.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {order._user?.profile?.fullName ??
                    order._user?.email ??
                    "N/A"}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {new Date(order.orderDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  ${Number(order.totalAmount).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Product Details:</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Product</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Unit Price</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>

          {orders.flatMap((order) =>
            order._items.map((item) => (
              <View key={`${order.id}-${item.id}`} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item._product?.name ?? "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    ${Number(item.unitPrice).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            )),
          )}
        </View>
      </View>
    </Page>
  </Document>
);

export const generateSalesReport = async (ordersData: Order[]) => {
  try {
    // Calculate totals
    const totalRevenue = ordersData.reduce(
      (sum: number, order: Order) => sum + Number(order.totalAmount),
      0,
    );
    const totalOrders = ordersData.length;
    const totalProducts = ordersData.reduce(
      (sum: number, order: Order) =>
        sum +
        order._items.reduce(
          (itemSum: number, item: OrderItem) => itemSum + item.quantity,
          0,
        ),
      0,
    );

    // Generate PDF
    const blob = await pdf(
      <SalesReportDocument
        orders={ordersData}
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        totalProducts={totalProducts}
      />,
    ).toBlob();

    // Download the PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating sales report:", error);
    return false;
  }
};

// Hook component that fetches orders and provides the generate function
export const useSalesReport = () => {
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = api.order.list.getAllOrders.useQuery(
    {
      limit: 100,
      offset: 0,
    },
    {
      enabled: false, // Don't fetch automatically
    },
  );

  const generateReport = async () => {
    try {
      // Fetch data when generating report
      const result = await refetch();

      if (!result.data?.orders) {
        throw new Error("No orders data available");
      }

      const orders = result.data.orders as Order[];
      return await generateSalesReport(orders);
    } catch (error) {
      console.error("Error fetching orders for report:", error);
      throw error;
    }
  };

  return {
    generateReport,
    isLoading,
    error,
    orders: ordersData?.orders as Order[] | undefined,
  };
};
