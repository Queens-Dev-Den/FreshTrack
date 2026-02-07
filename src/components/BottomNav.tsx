import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, ChefHat } from 'lucide-react';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
            <div className="max-w-3xl mx-auto flex">
                <button
                    onClick={() => navigate('/')}
                    className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Inventory</span>
                </button>
                <button
                    onClick={() => navigate('/recipes')}
                    className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${isActive('/recipes') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <ChefHat className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Recipes</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
