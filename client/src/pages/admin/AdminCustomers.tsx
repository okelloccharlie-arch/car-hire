import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { User } from "../../types";

export default function AdminCustomers() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get<{ data: User[] }>("/users")).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const customers = users?.filter((u) => u.role === "CUSTOMER") ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Customers</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-navy-500">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Phone</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 text-navy-500" colSpan={4}>Loading…</td>
              </tr>
            )}
            {customers.map((u) => (
              <tr key={u.id} className="border-b border-navy-50">
                <td className="py-3 font-medium text-navy-900">{u.firstName} {u.lastName}</td>
                <td className="py-3">{u.email}</td>
                <td className="py-3">{u.phone || "—"}</td>
                <td className="py-3 text-right">
                  <button className="text-rose-600 hover:text-rose-700" onClick={() => deleteMutation.mutate(u.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && !isLoading && (
              <tr>
                <td className="py-3 text-navy-500" colSpan={4}>No customers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
