'use client';

import MenuPageEditor from '@/components/Admin/MenuPageEditor';
import MenuPage from '@/app/menu/page';
import { EditorModeProvider } from '@/contexts/EditorModeContext';

export default function MenuEditorPage() {
  return (
    <EditorModeProvider isEditorMode={true}>
      <MenuPageEditor>
        <MenuPage />
      </MenuPageEditor>
    </EditorModeProvider>
  );
}
