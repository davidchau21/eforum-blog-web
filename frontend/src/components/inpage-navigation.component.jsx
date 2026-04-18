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
            <div className={`relative mb-6 flex flex-nowrap overflow-x-auto gap-1 bg-grey/50 p-1 rounded-xl ${isAllHidden ? 'hidden' : ''}`}>
                
                {
                    routes.map((route, i) => {
                        return (
                            <button 
                            ref={ i == defaultActiveIndex ? activeTabRef : null }
                            key={i} 
                            className={
                                "relative px-4 py-2 capitalize rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap " + 
                                ( inPageNavIndex == i 
                                    ? "bg-white text-black shadow-sm shadow-black/10 " 
                                    : "text-dark-grey hover:text-black hover:bg-white/60 " 
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

                {/* Hidden line ref still needed for positioning logic */}
                <hr ref={activeTabLineRef} className="hidden" />

            </div>

            { Array.isArray(children) ? children[inPageNavIndex] : children }

        </>
    )
}

export default InPageNavigation;