import UserForm from './user-form';

export default function EditUser({ user, regions, canManageSellers }: any) {
    return <UserForm user={user} regions={regions} canManageSellers={canManageSellers} />;
}
