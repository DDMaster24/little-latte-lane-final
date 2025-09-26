import EditableHomepage from '@/components/EditableHomepage';

export default function Home() {
  return (
    <>
      {/* Editable Homepage with admin controls */}
      <EditableHomepage enableEditing={true} />
    </>
  );
}