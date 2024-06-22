import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.REACT_APP_HOST_API;
export const ASSETS_API = process.env.REACT_APP_ASSETS_API;

export const MAPBOX_API = process.env.REACT_APP_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
// eslint-disable-next-line import/no-mutable-exports
let PATH_AFTER_LOGIN = paths.dashboard.root;

// Function to update the path
function updatePath(role: string) {
    switch(role){
        case 'admin':
            PATH_AFTER_LOGIN = paths.dashboard.root;
            break;
        case 'reviwer':
            PATH_AFTER_LOGIN = paths.dashboard.group.root;
            break;
        case 'student':
            PATH_AFTER_LOGIN = paths.dashboard.root;
            break;
        default:
            PATH_AFTER_LOGIN = paths.dashboard.root;
            break;

    }
}
export { PATH_AFTER_LOGIN, updatePath};
