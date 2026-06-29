import UserForm from './user-form';

export default function CreateUser({ regions }: any) {
    return <UserForm regions={regions} canManageSellers />;
}
