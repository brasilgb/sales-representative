import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { Pencil, Plus, UserCog } from 'lucide-react';
import moment from 'moment'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import InputSearch from '@/components/inputSearch';
import AppPagination from '@/components/app-pagination';
import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import { Badge } from '@/components/ui/badge';
import { roleUserByValue } from '@/Utils/functions';
import AdminLayout from '@/layouts/admin/admin-layout';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Usuários',
    href: '#',
  },
];

export default function Users({ users }: any) {
  const { flash, auth } = usePage().props as any;

  return (
    <AdminLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
      <Head title="Usuários" />
      <div className='flex items-center justify-between h-16 px-4 mb-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={UserCog} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar usuário" url="admin.users.index" />
        </div>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('admin.users.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Usuário</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.data.length > 0 ?
                users?.data?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user?.tenant?.company_name}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-medium">{user.telephone}</TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{roleUserByValue(user.roles)}</TableCell>
                    <TableCell>{user.is_active ? <Badge variant={'default'}>Ativo</Badge> : <Badge variant={'destructive'}>Inativo</Badge>}</TableCell>
                    <TableCell>{moment(user.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route("admin.users.edit", user.id)}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>

                      <ActionDelete title={'esta mensagem'} url={'admin.users.destroy'} param={user.id} />
                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            {users?.data.length > users?.total &&
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7}>
                    <AppPagination data={users} />
                  </TableCell>
                </TableRow>
              </TableFooter>
            }
          </Table>
        </div>
      </div>
    </AdminLayout>
  )
}
