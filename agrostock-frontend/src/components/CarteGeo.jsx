import React from 'react';

const CarteGeo = () => {
    return (
        <div className="rounded-5 overflow-hidden shadow-sm border border-light" style={{ height: '500px', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            <div className="text-center p-5">
                <div className="mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="#1ab273" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                </div>
                <h4 className="fw-bold">Cartographie des Transformateurs</h4>
                <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
                    Utilisation de Leaflet.js pour afficher la position geographique en temps reel de nos partenaires a travers le Benin.
                </p>
                <div className="badge bg-success opacity-75">Module Leaflet.js requis</div>
            </div>
        </div>
    );
};

export default CarteGeo;
