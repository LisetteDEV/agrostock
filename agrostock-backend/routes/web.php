<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\ArticleBlogController;
use App\Http\Controllers\ParametresController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\LitigeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ChatbotController;

Route::prefix('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Routes publiques â€“ pas d'authentification requise
    Route::get('/produits/publics', [ProduitController::class, 'getPublics']);
    Route::get('/produits/publics/{id}', [ProduitController::class, 'getPublicSingle']);
    Route::get('/categories', [ProduitController::class, 'getCategories']);
    Route::get('/transformateurs/publics', [AdminController::class, 'getPublicTransformateurs']);
    Route::get('/avis/recents', [AvisController::class, 'getRecents']);
    Route::get('/avis/transformateur/{id}', [AvisController::class, 'getByTransformateur']);
    Route::get('/blog/publics', [ArticleBlogController::class, 'indexPublic']);
    Route::get('/blog/publics/{slug}', [ArticleBlogController::class, 'showPublic']);
    Route::post('/contact', [ContactController::class, 'store']);
    Route::post('/chatbot/message', [ChatbotController::class, 'message'])->middleware('throttle:30,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/transformateur/documents', [AuthController::class, 'updateTransformateurDocuments']);
        Route::get('/transformateur/parametres/profile', [ParametresController::class, 'getTransformateurProfile']);
        Route::patch('/transformateur/parametres/generales', [ParametresController::class, 'updateTransformateurGenerales']);
        Route::patch('/transformateur/parametres/password', [ParametresController::class, 'changeTransformateurPassword']);

        // Routes Admin
        Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/admin/contact/messages', [ContactController::class, 'adminIndex']);
        Route::patch('/admin/contact/messages/{id}/traiter', [ContactController::class, 'markAsHandled']);
        Route::get('/admin/finance/stats', [AdminController::class, 'getFinanceStats']);
        Route::get('/admin/transactions', [AdminController::class, 'getTransactions']);
        Route::get('/admin/commandes', [AdminController::class, 'getAdminCommandes']);
        Route::get('/admin/litiges', [LitigeController::class, 'adminIndex']);
        Route::patch('/admin/litiges/{id}/resolve', [LitigeController::class, 'adminResolve']);
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::patch('/admin/users/{id}/suspend', [AdminController::class, 'suspendUser']);
        Route::patch('/admin/users/{id}/reactivate', [AdminController::class, 'reactivateUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'softDeleteUser']);
        Route::get('/admin/transformateurs/pending', [AdminController::class, 'getPendingTransformateurs']);
        Route::post('/admin/transformateurs/{id}/approve', [AdminController::class, 'approveTransformateur']);
        Route::post('/admin/transformateurs/{id}/reject', [AdminController::class, 'rejectTransformateur']);
        Route::get('/admin/produits', [AdminController::class, 'getAllProducts']);
        Route::delete('/admin/produits/{id}', [AdminController::class, 'deleteProduct']);
        Route::get('/admin/avis', [AvisController::class, 'getAllForAdmin']);
        Route::patch('/admin/avis/{id}/toggle-visibility', [AvisController::class, 'toggleVisibilityAdmin']);
        Route::delete('/admin/avis/{id}', [AvisController::class, 'destroyAdmin']);
        Route::get('/admin/blog', [ArticleBlogController::class, 'indexAdmin']);
        Route::post('/admin/blog', [ArticleBlogController::class, 'store']);
        Route::post('/admin/blog/{id}', [ArticleBlogController::class, 'update']);
        Route::delete('/admin/blog/{id}', [ArticleBlogController::class, 'destroy']);
        Route::get('/admin/parametres/profile', [ParametresController::class, 'getProfile']);
        Route::patch('/admin/parametres/generales', [ParametresController::class, 'updateGenerales']);
        Route::patch('/admin/parametres/commissions', [ParametresController::class, 'updateCommissions']);
        Route::patch('/admin/parametres/notifications', [ParametresController::class, 'updateNotifications']);
        Route::patch('/admin/parametres/password', [ParametresController::class, 'changePassword']);

        // Routes Produits (Transformateur)
        Route::get('/produits', [ProduitController::class, 'index']);
        Route::post('/produits', [ProduitController::class, 'store']);
        Route::post('/produits/{id}', [ProduitController::class, 'update']);
        Route::delete('/produits/{id}', [ProduitController::class, 'destroy']);

        // Routes Avis (Acheteur)
        Route::get('/avis/mes-avis', [AvisController::class, 'mesAvis']);
        Route::post('/avis', [AvisController::class, 'store']);
        Route::delete('/avis/{id}', [AvisController::class, 'destroy']);

        // Routes Paiement (simulation)
        Route::post('/paiements/simuler', [PaiementController::class, 'simuler']);

        // Routes Commandes
        Route::post('/commandes', [CommandeController::class, 'store']); // Acheteur crÃ©e commande
        Route::get('/acheteur/commandes', [CommandeController::class, 'getAcheteurCommandes']); // Acheteur voit
        Route::get('/acheteur/commandes/{id}/bon-retrait', [CommandeController::class, 'getBonRetrait']); // Acheteur recupere bon
        Route::patch('/acheteur/commandes/{id}/reception', [CommandeController::class, 'confirmReception']); // Acheteur confirme
        Route::post('/acheteur/commandes/{id}/litige', [LitigeController::class, 'ouvrir']); // Acheteur ouvre litige
        Route::get('/transformateur/commandes', [CommandeController::class, 'getTransformateurCommandes']); // Transfo voit
        Route::patch('/transformateur/commandes/{id}/statut', [CommandeController::class, 'updateStatus']); // Transfo modifie
        Route::post('/transformateur/commandes/{id}/valider-retrait', [CommandeController::class, 'validateRetrait']); // Transfo valide code+OTP
    });
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');







