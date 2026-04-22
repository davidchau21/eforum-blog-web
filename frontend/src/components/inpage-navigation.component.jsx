import { useState, useRef, useEffect } from "react";

export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({ routes, defaultHidden = [ ], hiddenAll = [ ], defaultActiveIndex = 0, children }) => {

    activeTabLineRef = useRef();
    activeTabRef = useRef();

    let [ inPageNavIndex, setInPageNavIndex ] = useState(null);

    let [ isResizeEventAdded, setIsResizeEventAdded ] = useState(false);
    let [ width, setWidth ] = useState(window.innerWidth);

    const changePageState = (btn, i) => {
        
        let { offsetWidth, offsetLeft } = btn; 

        activeTabLineRef.current.style.width = offsetWidth + "px"; 
        activeTabLineRef.current.style.left = offsetLeft + "px"; 

        setInPageNavIndex(i);

    }

    useEffect(() => {

        const isMobile = width <= 768; // Check if it's mobile
        const defaultIndex = isMobile ? routes.indexOf("Blogs Published") : defaultActiveIndex;

        if(width > 766 && inPageNavIndex != defaultActiveIndex){
            changePageState( activeTabRef.current, defaultActiveIndex )
        }

        if (inPageNavIndex === null && defaultIndex !== null) {
            setInPageNavIndex(defaultIndex); // Set default index
        }

        if (inPageNavIndex !== null && width <= 768) {
            changePageState(activeTabRef.current, inPageNavIndex); // Ensure the line position is updated
        }

        if(!isResizeEventAdded){
            window.addEventListener('resize', () => {
                if(!isResizeEventAdded){
                    setIsResizeEventAdded(true);
                }

                setWidth(window.innerWidth);
            })
        }

    }, [width])

    const isAllHidden = routes.every(route => 
        (typeof hiddenAll !== 'undefined' && hiddenAll.includes(route)) || 
        (width > 768 && defaultHidden.includes(route))
    );

    return (
        <>
            <div className={`inpage-tab-bar relative mb-0 bg-white flex flex-nowrap overflow-x-auto gap-6 border-b border-slate-200 scrollbar-hide px-5 pt-4 sticky top-[80px] z-10 ${isAllHidden ? 'hidden' : ''}`}>
                
                {
                    routes.map((route, i) => {
                        return (
                            <button 
                            ref={ i == defaultActiveIndex ? activeTabRef : null }
                            key={i} 
                            className={
                                "relative pb-3 capitalize text-sm font-semibold transition-all duration-200 whitespace-nowrap border-b-2 " + 
                                ( inPageNavIndex == i 
                                    ? "border-indigo-600 text-indigo-600 " 
                                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 " 
                                ) + 
                                ( defaultHidden.includes(route) ? " md:hidden " : " " ) +
                                ( (typeof hiddenAll !== 'undefined' && hiddenAll.includes(route)) ? " hidden " : " " )
                            } 
                            onClick={(e) => { changePageState(e.target, i) }}
                            >
                                { route }
                            </button>
                        )
                    })
                }

                {/* Hidden line ref still needed for positioning logic to prevent error */}
                <hr ref={activeTabLineRef} className="hidden" />

            </div>

            { Array.isArray(children) ? children[inPageNavIndex] : children }

        </>
    )
}

export default InPageNavigation;