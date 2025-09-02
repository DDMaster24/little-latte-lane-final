import HomepageEditor from '@/components/Admin/HomepageEditor';
import HomePage from '@/app/page';
import { EditorModeProvider } from '@/contexts/EditorModeContext';

export default function AdminHomepageEditorPage() {
  return (
    <EditorModeProvider isEditorMode={true}>
      <HomepageEditor>
        <HomePage />
      </HomepageEditor>
    </EditorModeProvider>
  );
}
