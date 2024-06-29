import { useMemo } from 'react';
import { paths } from 'src/routes/paths';
import SvgColor from 'src/components/svg-color';
import { useAuthContext } from 'src/auth/hooks';
import { NavItemBaseProps } from 'src/components/nav-section';

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  kanban: icon('ic_kanban'),
  ecommerce: icon('ic_ecommerce'),
  dashboard: icon('ic_dashboard'),
};

export function useNavData() {
  const { hasPermission } = useAuthContext();
  const data = useMemo(
    () => [
      // OVERVIEW
      {
        subheader: hasPermission('viewUsers') ? 'כללי': 'אזור אישי',
        items: [
          hasPermission('Scholarships') && { title: 'מלגות', path: paths.dashboard.root, icon: ICONS.dashboard },
          hasPermission('MyScholarships') && { title: 'הבקשות שלי', path: paths.dashboard.myScholraships, icon: ICONS.ecommerce },
          hasPermission('Scholarships') && { title: 'בקשות סטודנטים', path: paths.dashboard.studentsApplications, icon: ICONS.ecommerce }, // todo: changes permission
        ].filter(Boolean) as NavItemBaseProps[], // Filter out null values and assert type
      },

      // MANAGEMENT
      {
        subheader: 'ניהול',
        items: [
          hasPermission('viewUsers') && { title: 'דירוג סטונדטים', path: paths.dashboard.group.root, icon: ICONS.user },
          hasPermission('CreateScholarship') && { title: 'יצירת מלגה', path: paths.dashboard.group.five, icon: ICONS.kanban },
        ].filter(Boolean) as NavItemBaseProps[], // Filter out null values and assert type
      },
    ].filter(section => section.items.length > 0), // Filter out sections with no items
    [hasPermission]
  );

  return data;
}