const fr = {
  translation: {
    msStatus: {
      new: 'Non soumis',
      submitted: 'Soumis',
      accepted: 'Accepté',
      evaluated: 'Évalué',
      rejected: 'Rejeté',
      revise: 'Réviser',
      revising: 'En révision',
      published: 'Publié',
      assigned: "Epreuve d'auteur attribuée",
      inProgress: "Révision de l'auteur en cours",
      completed: "Epreuve d'auteur complétée",
      underEmbargo: 'Sous embargo',
      embargoReleased: 'Embargo levé',
      unpublished: 'Non publié',
      unknown: 'Inconnu',
    },
    reviewerStatus: {
      invited: 'Invité',
      rejected: 'Refusé',
      declined: 'Refusé',
      accepted: 'Accepté',
      inProgress: 'En cours',
      completed: 'Terminé',
      closed: 'Fermé',
      completedClosed: 'Terminé / Fermé',
      unanswered: 'Sans réponse',
      notAssignedForThisVersion: "N'est pas évaluateur de la version actuelle",
    },
    common: {
      cms: 'CMS',
      pdf: 'PDF',
      OK: 'Ok',
      Cancel: 'Annuler',
      Yes: 'Oui',
      No: 'Non',
      Save: 'Enregistrer',
      Update: 'Mettre à jour',
      Activate: 'Activer',
      Deactivate: 'Désactiver',
      Create: 'Créer',
      Modified: 'Modifié',
      Confirm: 'Confirmer',
      Delete: 'Supprimer',
      View: 'Voir',
      'Enter search terms...': 'Saisissez des termes de recherche...',
      surroundMultiword:
        'Entourez les expressions à plusieurs mots avec des guillemets "". Excluez un terme en le préfixant avec -. Spécifiez des correspondances alternatives en utilisant OU. Utilisez * comme joker pour les fins de mots. Enveloppez les sous-expressions entre parenthèses ().',
      noOption: "Pas d'option",
      danteRangeCalendar: {
        Presets: 'Préconfigurations',
        Today: "Aujourd'hui",
        Yesterday: 'Hier',
        'Past 7 days': '7 derniers jours',
        'Past 30 days': '30 derniers jours',
        'Past 90 days': '90 derniers jours',
        'Past year': 'Année passée',
        Clear: 'Effacer',
      },
      roles: {
        Admin: 'Admin',
        'Group Admin': 'Administrateur de groupe',
        'Group Manager': 'Gestionnaire de groupe',
        User: 'Utilisateur',
      },
      emailUpdate: {
        invalidEmail: 'Email invalide',
        emailTaken: 'Email déjà utilisé',
        smthWentWrong: 'Une erreur est survenue',
      },
      relativeDateStrings: {
        today: "aujourd'hui",
        yesterday: 'hier',
        daysAgo: 'il y a {{count}} jour',
        daysAgo_plural: '{{count}} jours auparavant',
      },
      recommendations: {
        Accept: 'Accepter',
        Revise: 'Réviser',
        Reject: 'Rejeter',
      },
      teams: {
        assign: 'Attribuer à {{teamLabel}}...',
        'Senior Editor': 'Éditeur en chef',
        'Handling Editor': 'Éditeur responsable',
        Editor: 'Éditeur',
      },
      kanban: {
        'Last updated': 'Dernière mise à jour',
        'Invited via email': 'Invité par email',
        isCollaborative: 'Revue collaborative',
      },
      days: {
        day: 'jour',
        day_plural: 'jours',
      },
      statuses: {
        success: 'Succès',
        info: 'Information',
        warning: 'Avertissement',
        error: 'Erreur',
      },
    },
    leftMenu: {
      'Summary Info': 'Résumé des infos',
      Manuscript: 'Manuscrit',
      Dashboard: 'Tableau de bord',
      Manuscripts: 'Manuscrits',
      Reports: 'Rapports',
      Settings: 'Paramètres',
      Forms: 'Formulaires',
      Submission: 'Soumission',
      Review: 'Révision',
      Decision: 'Décision',
      Tasks: 'Tâches',
      Users: 'Utilisateurs',
      Configuration: 'Configuration',
      Emails: 'E-mails',
      CMS: 'CMS',
      Pages: 'Pages',
      Layout: 'Mise en page',
      Article: "Modèle d' article",
      'Go to your profile': 'Accéder à votre profil',
      FileBrowser: 'Explorateur de fichiers',
      Metadata: 'Métadonnées de Publication',
      Collections: 'Colecciones',
    },
    menuSettings: {
      KeepMenuVisible: 'Garder le menu visible',
      MinimalSidebar: 'Barre latérale minimale',
    },
    profilePage: {
      'Your profile': 'Votre profil',
      'Profile: ': 'Profil : ',
      Logout: 'Déconnexion',
      Username: "Nom d'utilisateur",
      Email: 'Email',
      Language: 'Langue',
      Change: 'Changer',
      usernameWarn:
        'Ne peut pas commencer par un chiffre ou débuter ou finir par des espaces',
      userPrivilegeAlert: `Droits d'utilisateur requis
        <br /> Veuillez vous assurer que vous avez les permissions de rôle appropriées ou
        contactez votre administrateur système pour obtenir de l'aide.`,
      'Drop it here': 'Déposez-le ici',
      'Change profile picture': 'Changer la photo de profil',
      'Mute all discussion email notifications':
        'Désactiver toutes les notifications par e-mail pour les discussions',
      ORCID: 'ORCID',
    },
    manuscriptsTable: {
      'No matching manuscripts were found':
        'Aucun manuscrit correspondant trouvé',
      'Manuscript number': 'Numéro de manuscrit',
      Created: 'Créé',
      Updated: 'Mis à jour',
      lastReviewerStatusUpdate: 'Dernière mise à jour du statut du réviseur',
      Status: 'Statut',
      'Your Status': 'Votre statut',
      adaState: 'ADA Statut',
      Title: 'Titre',
      Version: 'Version',
      Author: 'Auteur',
      Editor: 'Éditeur',
      'Reviewer Status': 'Statut du réviseur',
      Actions: 'Actions',
      Control: 'Contrôle',
      Production: 'Production',
      'No results found': 'Aucun résultat trouvé',
      pagination: `Affichage de <strong>{{firstResult}}</strong> à <strong>{{lastResult}}</strong> sur <strong>{{totalCount}}</strong> résultats`,
      reviewAccept: 'Accepter',
      reviewReject: 'Rejeter',
      reviewDo: 'Faire la révision',
      reviewCompleted: 'Terminé',
      reviewContinue: 'Continuer la révision',
      viewOldReviews: 'Voir les anciennes évaluations',
      all: 'Tous',
      Search: 'Rechercher',
      actions: {
        Evaluation: 'Évaluation',
        Control: 'Contrôle',
        View: 'Voir',
        Archive: 'Archiver',
        Production: 'Production',
        Publish: 'Publier',
        confirmArchive:
          'Veuillez confirmer que vous souhaitez archiver ce manuscrit',
        confirmArchiveButton: 'Archiver',
        cancelArchiveButton: 'Annuler',
        'Publishing error': "Erreur d'édition",
        'Some targets failed to publish':
          'Certains objectifs ont échoué à publier.',
        continueSubmission: 'Continuer la soumission',
        revise: 'Réviser',
        continueRevision: 'Continuer la révision',
      },
    },
    dashboardPage: {
      Dashboard: 'Tableau de bord',
      'New submission': '+ Nouvelle soumission',
      'New Alerts': 'Nouvelles alertes',
      'My Submissions': 'Mes soumissions',
      'To Review': 'Affectations de révision',
      "Manuscripts I'm editor of": "File d'attente d'édition",
      mySubmissions: {
        'Provide production feedback':
          'Fournir des commentaires sur la production',
        'View production feedback':
          'Afficher les commentaires sur la production',
      },
    },
    submitPage: {
      unauthorized: "Cette soumission n'est pas accessible.",
    },
    reviewPage: {
      Versions: 'Versions',
      'Anonymous Reviewer': 'Réviseur anonyme',
      Submit: 'Soumettre',
      neverSubmitted: "Cette évaluation n'a pas été soumise",
      isCollaborative: 'Révision collaborative',
      unauthorized: "Cet avis n'est pas accessible.",
    },
    reviewVerdict: {
      accept: 'accepter',
      revise: 'réviser',
      reject: 'rejeter',
    },
    manuscriptsPage: {
      Manuscripts: 'Manuscrits',
      archivedManuscripts: 'Manuscrits archivés',
      viewArchived: 'Voir les manuscrits archivés',
      viewUnarchived: 'Retourner aux manuscrits non archivés',
      manuscriptInvalid:
        'Ce manuscrit a des champs incomplets ou invalides. Veuillez les corriger et réessayer.',
      importPending: 'en attente',
      Refreshing: 'Actualisation',
      Refresh: 'Actualiser',
      Select: 'Sélectionner',
      'Select All': 'Sélectionner tout',
      selectedArticles: '{{count}} articles sélectionnés',
      Archive: 'Archiver',
      Unarchive: "Restaurer depuis l'archive",
      confirmArchive:
        'Veuillez confirmer que vous souhaitez archiver les manuscrits sélectionnés.',
      confirmUnarchive:
        'Veuillez confirmer que vous souhaitez restaurer le statut non archivé des manuscrits sélectionnés.',
      takeAction: 'Action',
      exportAsJson: 'Télécharger JSON',
    },
    decisionPage: {
      'Current version': 'Version actuelle',
      Team: 'Équipe',
      Decision: 'Décision',
      'Manuscript text': 'Texte du manuscrit',
      Metadata: 'Métadonnées',
      'Tasks & Notifications': 'Tâches et notifications',
      'COAR Notify Metadata': 'Métadonnées COAR Notify',
      'Assign Editors': 'Attribuer des éditeurs',
      'Reviewer Status': 'Statut du réviseur',
      authorStatus: "Statut d'auteur",
      Version: 'Version',
      'See Declined': 'Voir refusé ({{count}})',
      'Hide Declined': 'Masquer refusé',
      'No Declined Reviewers': 'Aucun réviseur refusé',
      'Invite Reviewers': 'Inviter des réviseurs',
      'New User': 'Nouvel utilisateur',
      selectUser: 'Sélectionner...',
      'Invite reviewer': 'Inviter un réviseur',
      'Invite and Notify': 'Inviter et notifier',
      'User email address opted out':
        "L'utilisateur a choisi de ne pas recevoir d'e-mails",
      inviteUser: {
        Email: 'Email',
        Name: 'Nom',
        Collaborate: 'Collaborer',
      },
      declinedInvitation: 'Refusé {{dateString}}',
      'Invited via email': 'Invité par email',
      'View Details': 'Voir les détails',
      'Assign Author for Proofing': 'Attribuer un auteur pour la vérification',
      'Submit for author proofing':
        "Soumettre pour la vérification de l'auteur",
      authorRequired: "Nécessite qu'un auteur soit invité !",
      hideAssignedAuthors: 'Masquer tous les auteurs attribués',
      showAssignedAuthors: 'Afficher tous les auteurs attribués',
      assignedOn: '{{assigneeName}} attribué le {{date}}',
      decisionTab: {
        'Archived version': 'Version Archivée',
        notCurrentVersion:
          "Ce n'est pas la version actuelle, mais une version archivée en lecture seule du manuscrit.",
        'Completed Reviews': 'Révisions Terminées',
        'Collaborative Reviews': 'Révisions Collaboratives',
        noReviews: 'Aucune révision terminée pour le moment.',
        reviewNum: 'Révision {{num}}',
        'Anonmyous Reviewer': 'Réviseur Anonyme',
        'Hide review': 'Masquer la Révision',
        'Hide reviewer name': 'Masquer le Nom du Réviseur',
        lockReview: 'Verrouiller la Révision',
        reviewModalShow: 'Afficher',
        reviewModalHide: 'Masquer',
        Submit: 'Soumettre',
        Publishing: 'Publication',
        publishOnlyAccepted:
          'Vous pouvez uniquement publier les soumissions acceptées.',
        publishingNewEntry:
          'La publication ajoutera une nouvelle entrée sur le site public et ne pourra pas être annulée.',
        currentAdaStatus: 'Statut ADA',
        refreshAdaStatus: 'Actualiser le Statut ADA',
        UpdateAda: 'Mettre à Jour ADA',
        PublishingAda: 'Publier avec ADA',
        PublishingAdaState: 'État ADA',
        Draft: 'Rédiger',
        Findable: 'Rendre Accessible',
        Process: 'Traiter',
        Publish: 'Publier',
        Republish: 'Republier',
        Unpublish: 'Dépublier',
        unpublishResponse: 'Le manuscrit a été dépublié avec succès',
        postedTo: 'Publié sur {{stepLabel}}',
        errorPosting: 'Erreur de publication sur {{stepLabel}}',
        publishedOn: 'Cette soumission a été publiée le {{date}}',
        doisToBeRegistered: 'DOIs à enregistrer : {{- dois}}',
        noDoisToBeRegistered:
          'Aucun DOI ne sera enregistré au moment de la publication.',
      },
      metadataTab: {
        'Manuscript Number': 'Numéro de manuscrit:',
      },
      tasksTab: {
        Notifications: 'Notifications',
        'New User': 'Nouvel utilisateur',
        'Choose receiver': 'Choisir le destinataire',
        'Choose notification template': 'Choisir le modèle de notification',
        Notify: 'Notifier',
        'User email address opted out':
          "L'utilisateur a choisi de ne pas recevoir d'e-mails",
        Tasks: 'Tâches',
        newUser: {
          Email: 'Email',
          Name: 'Nom',
        },
      },
      'Add another person': 'Ajouter une autre personne',
      'Add another doi': 'Ajouter une autre DOI',
      'Delete this author': 'Supprimer cet auteur',
      invalidDoi: 'Le DOI est invalide',
      unauthorized: "Cette ressource n'est pas accessible.",
      coarTab: {
        noMessages: "Il n'y a pas de messages COAR Notify",
        Offer: 'Offrir',
        Accept: 'Accepter',
        Reject: 'Rejeter',
        TentativeAccept: 'Accepter provisoirement',
        TentativeReject: 'Rejeter provisoirement',
        Announce: 'Annoncer',
        Flag: 'Signaler',
        Undo: 'Annuler',
        EndorsementAction: 'Approbation',
        ReviewAction: 'Révision',
        RelationshipAction: 'Relation',
        UnprocessableNotification: 'Notification non traitable',
        IngestAction: 'Importer',
        actor: 'Acteur',
        resourceUrl: 'URL de la ressource',
        from: 'De',
        rawPayload: 'Charge utile brute',
      },
    },
    editorSection: {
      noFileLoaded: 'Aucun fichier de manuscrit chargé',
      noSupportedView: 'Aucune vue supportée du fichier',
    },
    reviewDecisionSection: {
      noDecisionUpdated:
        "Aucune décision n'a encore été mise à jour pour ce manuscrit",
    },
    otherReviewsSection: {
      noSharedReviews:
        "Aucune évaluation collaborative n'est disponible pour ce manuscrit pour le moment",
    },
    cmsPage: {
      article: {
        title: "Modèle d' Article",
      },
      metadata: {
        cmsMetadata: 'Métadonnées du CMS',
        title: 'Titre',
        description: 'Description',
        publicationDate: 'Date de publication',
        image: 'Image',
        deleteImage: "Supprimer l'image",
        issueNumber: 'Numéro de parution',
        delete: 'Supprimer',
        create: 'Créer',
        update: 'Mettre à jour',
        isActive: 'Est actif/active',
        noCollections: 'Aucune collection',
        addCollection: 'Ajouter une collection',
        copy: 'Copier',
      },
      pages: {
        addNew: 'Ajouter une nouvelle page',
        'New Page': 'Nouvelle Page',
        Pages: 'Pages',
        Publish: 'Publier',
        'Saving data': 'Enregistrement des données',
        Rebuilding: 'Reconstruction en cours...',
        Published: 'Publié',
        Delete: 'Supprimer',
        fields: {
          title: 'Titre de la page*',
          url: 'URL',
        },
        'New edits on page': 'Nouvelles modifications sur la page',
        'Edited on': 'Modifié le {{date}}',
        'Published on': 'Publié le {{date}}',
        'Not published yet': 'Pas encore publié',
      },
      layout: {
        Publish: 'Publier',
        Layout: 'Mise en page',
        'Saving data': 'Enregistrement des données',
        'Rebuilding Site': 'Reconstruction du site en cours...',
        Published: 'Publié',
        'Brand logo': 'Logo de la marque',
        'Brand Color': 'Couleur de la marque',
        fields: {
          primaryColor: 'Couleur primaire',
          secondaryColor: 'Couleur secondaire',
        },
        Header: 'Menu',
        useCheckbox:
          'Utilisez la case à cocher pour afficher ou masquer la page dans le menu. Cliquez et faites glisser pour les réorganiser.',
        Footer: 'Pied de page',
        Partners: 'Partenaires',
        'Footer Text': 'Texte du pied de page',
        'Footer Page links': 'Liens des pages du pied de page',
        Status: 'Statut',
        draftModeWarning:
          "L'activation du mode brouillon rendra votre site de production temporairement indisponible pendant la reconstruction du site par Flax. Votre site restera inaccessible jusqu'à sa désactivation. Votre site Web de publication ne sera visible que par ceux qui ont accès au lien Draft.",
        DraftCheckbox: 'Brouillon',
      },
      fileBrowser: {
        confirmDelete: 'Supprimer',
        deleteResource: 'Êtes-vous sûr de vouloir supprimer cette ressource ?',
      },
    },
    authorsInput: {
      firstName: {
        label: 'Prénom',
        placeholder: 'Saisissez le prénom...',
      },
      lastName: {
        label: 'Nom',
        placeholder: 'Saisissez le nom...',
      },
      middleName: {
        label: 'Prénom',
        placeholder: 'Entrez le prénom...',
      },
      orcid: {
        label: 'ID ORCID',
        placeholder: "Entrez l'ID ORCID...",
      },
      ror: {
        label: 'Affiliation ROR',
        placeholder: "Entrez l'affiliation ROR...",
      },
      email: {
        label: 'Email',
        placeholder: 'Saisissez le courrier électronique...',
      },
    },
    dragndrop: {
      'Drag and drop your files here': 'Glissez et déposez vos fichiers ici',
      'Drag and drop files': 'Glissez-déposez les fichiers {{fileType}} ici',
      'Drag and drop other files here': "Glissez-déposez d'autres fichiers ici",
      'Your file has been uploaded': 'Votre fichier a été téléchargé.',
      Remove: 'Retirer',
    },
    productionPage: {
      Production: 'Production',
      AuthorProofing: "Vérification de l'auteur",
      Feedback: 'Retour',
      Attachments: 'Pièces jointes',
      Submitted: 'Soumis',
      Submit: 'Soumettre',
      'Edited on': 'Edité le {{date}}',
      submittedOn: '{{submitterName}} soumis le {{date}}',
      'read-only': ' (lecture seulement)',
      'Previous Feedback Submissions':
        'Soumissions de commentaires précédentes',
      'No supported view of the file': 'Aucune vue supportée du fichier',
      'No feedback submissions': 'Aucune soumission de commentaires',
      Download: 'Télécharger',
      Editor: 'Éditeur',
      'PDF CSS': 'CSS du PDF',
      'PDF template': 'Modèle PDF',
      'PDF assets': 'Ressources PDF',
      'PDF metadata': 'Métadonnées du PDF',
    },
    invitationResults: {
      author: 'auteur',
      reviewer: 'réviseur',
      declinedAndOptedOut:
        "A décliné l'invitation {{invitationType}} et a choisi de se désinscrire",
      declined: "A décliné l'invitation {{invitationType}}",
      accepted: "A accepté l'invitation {{invitationType}}",
    },
    configPage: {
      generalTab: 'Général',
      workflowTab: 'Flux de travail',
      productionTab: 'Production',
      integrationsAndPublishingTab:
        'Intégrations et points de terminaison de publication',
      notificationsTab: 'Notifications et courrier électronique',
      emailNotificationsTab: 'Paramètres de messagerie',
      emailTab: "Modèles d'email",
      Configuration: 'Configuration',
      'Instance Type': "Type d'instance",
      'Group Identity': 'Identité du groupe',
      'Brand name': 'Nom de la marque',
      title: 'Titre',
      description: 'Description',
      issn: 'ISSN',
      electronicIssn: 'ISSN électronique',
      contact: 'Contact',
      'Brand primary colour': 'Couleur principale de la marque',
      'Brand secondary colour': 'Couleur secondaire de la marque',
      Logo: 'Logo',
      Favicon: 'Icône de favori',
      Dashboard: 'Tableau de bord',
      MySubmissionsColumnFields: 'Champs de la colonne Mes soumissions',
      ReviewAssignmentsColumnFields:
        'Champs de colonne des affectations de révision',
      EditingQueueColumnFields:
        "Édition des champs de la colonne de la file d'attente",
      landingPage:
        "Page d'accueil pour les utilisateurs du gestionnaire de groupe après la connexion",
      'Dashboard Page': 'Page du tableau de bord',
      'Manuscript Page': 'Page du manuscrit',
      pagesVisibleToRegistered:
        'Pages du tableau de bord visibles aux utilisateurs enregistrés',
      'My Submissions': 'Mes soumissions',
      'To Review': 'Affectations de révision',
      "Manuscripts I'm editor of": "File d'attente d'édition",
      'Manuscripts page': 'Page des manuscrits',
      'List columns to display on the Manuscripts page':
        'Liste des colonnes à afficher sur la page des manuscrits',
      numberOfManuscripts:
        'Nombre de manuscrits listés par page sur la page des manuscrits',
      hourManuscriptsImported:
        'Heure à laquelle les manuscrits sont importés quotidiennement (UTC)',
      daysManuscriptRemain:
        "Nombre de jours pendant lesquels un manuscrit doit rester sur la page des manuscrits avant d'être automatiquement archivé (laissez-le vide si vous ne souhaitez pas utiliser l'archivage automatique)",
      importFromSematic:
        'Importer des manuscrits de Semantic Scholar datant de moins de « x » nombre de jours',
      newSubmissionActionVisisble:
        'Action « Ajouter une nouvelle soumission » visible sur la page des manuscrits',
      displayActionToSelect:
        "Afficher l'action pour « Sélectionner » des manuscrits pour l'évaluation à partir de la page des manuscrits",
      importManuscriptsManually:
        "Importer manuellement des manuscrits en utilisant l'action « Actualiser »",
      'Control panel': 'Panneau de contrôle',
      'Display manuscript short id':
        "Afficher l'identifiant court du manuscrit",
      displayAuthorKanban: "Afficher le tableau de l'équipe auteur",
      'Author proofing enabled':
        'Autoriser les auteurs à participer aux cycles de relecture',
      'Reviewers can see submitted reviews':
        'Les évaluateurs peuvent voir les évaluations soumises',
      'Authors can see individual peer reviews':
        'Les auteurs peuvent voir les évaluations par les pairs individuelles',
      'Control pages visible to editors':
        'Pages de contrôle visibles aux éditeurs',
      Team: 'Équipe',
      Submission: 'Soumission',
      SubmissionPage: {
        title: 'Titre',
        description: 'Description',
        allowAuthorUploadOnly:
          'Autoriser un auteur à télécharger un fichier de manuscrit uniquement',
        allowAuthorUploadWithForm:
          'Autoriser un auteur à télécharger un fichier de manuscrit avec un formulaire',
        allowAuthorSubmitForm: 'Autoriser un auteur à soumettre un formulaire',
        allowAuthorSubmitFormWithBlankEditor:
          'Autoriser un auteur à soumettre un formulaire et accéder à un éditeur vide',
        preventGmFromEditing:
          "Empêcher le Responsable de groupe de modifier un manuscrit qu'il a rédigé après la soumission",
      },
      coarNotify: 'COAR-Notifier',
      aiDesignStudio: 'Studio de conception IA et assistant IA ',
      localContextApiKey: 'Clé API du contexte local',
      openAiApiKey: `Clé d'accès OpenAI`,
      addLocalContextApiKey: 'Ajoutez votre clé API de contexte local',
      acceptedIPs: 'IP acceptées',
      allowToSubmitNewVersion:
        'Permettre à un auteur de soumettre une nouvelle version de son manuscrit à tout moment',
      'Review page': "Page d'évaluation",
      showSummary:
        'Les évaluateurs peuvent voir les données du formulaire de décision',
      hideDiscussionFromGroupAdminsManagers:
        'Masquer la discussion des administrateurs de groupe et des gestionnaires de groupe',
      hideDiscussionFromEditorsReviewersAuthors:
        'Masquer la discussion aux éditeurs, critiques et auteurs',
      hideDiscussionFromAuthors: 'Masquer la discussion aux auteurs uniquement',
      hideDiscussionFromReviewers:
        'Masquer la discussion aux évaluateurs uniquement',
      Publishing: 'Publication',
      Integrations: 'Intégrations',
      Hypothesis: 'Hypothèse',
      'Hypothesis API key': 'Clé API Hypothèse',
      'Hypothesis group id': 'ID du groupe Hypothèse',
      shouldAllowTagging:
        'Appliquer des tags Hypothèse dans le formulaire de soumission',
      reverseFieldOrder:
        "Inverser l'ordre des champs du formulaire de soumission/décision publiés à Hypothèse",
      Crossref: 'Crossref',
      journalAbbreviatedName: 'Nom abrégé',
      rorUrl: 'URL du Registre des organisations de recherche (ROR)',
      journalHomepage: "Page d'accueil",
      crossrefLogin: "Nom d'utilisateur Crossref",
      crossrefPassword: 'Mot de passe Crossref',
      crossrefRegistrant: 'ID du déposant Crossref',
      crossrefDepositorName: 'Nom du déposant Crossref',
      crossrefDepositorEmail: 'Adresse e-mail du déposant Crossref',
      publicationType: 'Sélectionner le type de publication',
      crossrefDoiPrefix: 'Préfixe DOI Crossref',
      crossrefPublishedArticleLocationPrefix: 'Domaine publié par Crossref',
      crossrefUseSandbox: 'Publier dans le bac à sable Crossref',
      ada: 'Paramètres ADA',
      enableAdaPublish: 'Activer la publication ADA',
      adaLogin: "Nom d'utilisateur ADA",
      adaPassword: 'Mot de passe ADA',
      Datacite: 'Datacite',
      dataciteLogin: "Nom d'utilisateur Datacite",
      datacitePassword: 'Mot de passe Datacite',
      dataciteUseSandbox: 'Publier dans le bac à sable Datacite',
      dataciteDoiPrefix: 'Préfixe DOI Datacite',
      publishedArticleLocationPrefixDatacite:
        "Emplacement de l'article publié Datacite",
      publisher: 'Éditeur',
      doajDoiPrefix: 'Préfixe DOI DOAJ',
      doajPublishedArticleLocationPrefix:
        "Emplacement de l'article publié DOAJ",
      doajUseSandbox: 'Publier dans le bac à sable DOAJ',
      licenseUrl: 'URL de la licence de publication',
      DOAJ: 'DOAJ',
      doajLogin: 'Nom d’utilisateur DOAJ',
      doajPassword: 'Mot de passe DOAJ',
      doajRegistrant: 'DOAJ API key',
      doajDepositorName: 'Nom du déposant DOAJ',
      doajDepositorEmail: 'Adresse e-mail du déposant DOAJ',
      Webhook: 'Webhook',
      webhookUrl: 'URL du webhook de publication',
      webhookToken: 'Jeton du webhook de publication',
      webhookRef: 'Référence du webhook de publication',
      'Task Manager': 'Gestionnaire de tâches',
      teamTimezone:
        'Définir le fuseau horaire pour les dates limites du gestionnaire de tâches',
      Emails: 'Emails',
      emailNotification: {
        smtpSettings: 'Paramètres SMTP',
        description:
          'Kotahi vous permet de vous connecter au fournisseur de messagerie de votre choix (par exemple SendGrid, Mailgun, etc.) via SMTP. Si vous ne savez pas quelles valeurs utiliser ci-dessous, veuillez consulter la documentation SMTP de votre fournisseur.',
        from: 'Expéditeur',
        host: 'Hôte',
        port: 'Port',
        user: 'Utilisateur',
        pass: 'Mot de passe',
        bcc: 'BCC',
        fromDescription:
          "L'e-mail de l'expéditeur tel qu'il apparaît pour le destinataire et l'adresse e-mail de l'expéditeur. Notez que vous devrez peut-être configurer cette adresse dans les paramètres de votre fournisseur de messagerie.",
        hostDescription: "Le nom d'hôte SMTP de votre fournisseur.",
        portDescription:
          "Le port SMTP utilisé par votre fournisseur de messagerie. Veuillez noter que nous utilisons une connexion SSL sécurisée, alors assurez-vous d'utiliser le port SSL tel que défini dans la documentation de votre fournisseur de messagerie (généralement 465).",
        userDescription:
          "Le nom d'utilisateur utilisé pour se connecter à votre fournisseur de messagerie à des fins d'authentification. Notez qu'il s'agit du nom d'utilisateur de votre compte de messagerie, et non de votre nom d'utilisateur Kotahi.",
        passDescription:
          "Le mot de passe qui sera utilisé avec le nom d'utilisateur pour l'authentification.",
        bccDescription:
          'Incluez une adresse e-mail facultative pour mettre en copie cachée tous les e-mails sortants de Kotahi.',
        advancedSettings: 'Paramètres avancés',
        advancedSettingsDescription:
          'Les fournisseurs de messagerie exigent souvent une connexion sécurisée pour fonctionner. En général, les connexions utilisant le port 465 établissent une connexion sécurisée immédiatement, tandis que celles utilisant le port 587 ne le font pas mais essaient de passer à une connexion sécurisée une fois le contact établi. <strong>Il n’est pas recommandé de laisser les deux options désactivées.</strong>',
        secure: 'Connexion sécurisée',
        secureDescription:
          'Établit une connexion sécurisée avec votre serveur de messagerie. Devrait généralement être activée pour les connexions utilisant le port 465.',
        requireTLS: 'Exiger TLS',
        requireTLSDescription:
          'Applicable uniquement si la connexion sécurisée est désactivée. Cela établira une connexion non sécurisée avec votre serveur de messagerie et passera immédiatement à une connexion sécurisée une fois la connexion établie.',
      },
      eventNotification: "Notifications d'événement",
      reviewRejectedEmailTemplate:
        "L'évaluateur rejette une invitation à évaluer",
      reviewerInvitationPrimaryEmailTemplate: "Invitation à l'évaluation",
      reviewerCollaborativeInvitationPrimaryEmailTemplate:
        'Invitación al revisor collaborer',
      evaluationCompleteEmailTemplate: 'Décision soumise',
      submissionConfirmationEmailTemplate: 'Manuscrit soumis',
      alertUnreadMessageDigestTemplate: 'Message de discussion non lu',
      authorProofingInvitationEmailTemplate:
        "Invitation attribuée à l'épreuve d'auteur",
      authorProofingSubmittedEmailTemplate:
        "Preuve d'auteur complétée et commentaires soumis",
      'Editors edit reviews': 'Les éditeurs peuvent modifier les avis soumis',
      editorsEditDiscussionPosts:
        'Les éditeurs peuvent modifier les messages soumis sur le terrain du formulaire de discussion',
      groupManagersCanPublish:
        'Les responsables de groupe peuvent publier des articles/avis',
      editorsCanPublish: 'Les éditeurs peuvent publier des articles/critiques',
      editorsDeleteReviews: 'Les éditeurs peuvent supprimer les avis soumis',
      Reports: 'Rapports',
      reportShowInMenu:
        "Le gestionnaire de groupe et l'administrateur peuvent accéder aux rapports",
      'User Management': 'Gestion des utilisateurs',
      userIsAdmin:
        "Tous les utilisateurs sont assignés les rôles de gestionnaire de groupe et d'administrateur",
      kotahiApis: 'API Kotahi',
      tokens: 'Jetons',
      Update: 'Mise à jour',
      article: 'article',
      'peer review': 'évaluation par les pairs',
      'enable Ai': "Activer l'IA",

      showTabs: {
        Team: 'Équipe',
        Decision: 'Décision',
        Reviews: 'Commentaires',
        'Manuscript text': 'Texte du manuscrit',
        Metadata: 'Métadonnées',
        'Tasks & Notifications': 'Tâches et notifications',
        'COAR Notify Metadata': 'Métadonnées COAR Notify',
      },
      crossrefRetrievalEmail:
        'E-mail à utiliser pour la recherche de citations',
      crossrefSearchResultCount:
        'Nombre de résultats à retourner de la recherche de citations',
      crossrefStyleName: 'Sélectionnez le format pour les citations',
      crossrefLocaleName: 'Sélectionnez la langue pour les citations',
      production: {
        Production: 'Analyse des citations',
        'Email to use for citation search':
          'Adresse e-mail pour la correspondance de recherche Crossref et de récupération de données',
        'Number of results to return from citation search':
          'Nombre de résultats à renvoyer à partir d’une recherche Crossref',
        'Select style formatting for citations':
          'Sélectionnez le style de citation',
        apa: 'American Psychological Association (APA)',
        cmos: 'Manuel de style de Chicago (CMOS)',
        cse: 'Conseil des éditeurs scientifiques (CSE)',
        'Select locale for citations':
          'Sélectionnez les paramètres régionaux de la citation',
        citationStyles: 'Styles de citations',
        manuscriptVersionHistory: 'Historique des versions du manuscrit',
        getDataFromDatacite:
          'Obtenez des données de citation à partir de Datacite',
        fallbackOnCrossrefAfterDatacite:
          'Si la récupération de Datacite ne donne aucun résultat, sélectionnez le résultat Crossref comme solution de secours',
        historyIntervalInMinutes:
          'Intervalle pour enregistrer automatiquement une version manuscrite en quelques minutes',
      },
      allowedIPs: 'Liste des adresses IP du référentiel autorisées à accéder',
      scietyInboxUrl: 'URL de la boîte de réception de Sciety',
      api: 'API Kotahi',
      // Since these are publishing servers, hence kept the original language
      semanticScholarPublishingServers: {
        'Association for Computational Linguistics':
          'Association for Computational Linguistics',
        'Association for Computing Machinery':
          'Association for Computing Machinery',
        arXiv: 'arXiv',
        BioOne: 'BioOne',
        bioRxiv: 'bioRxiv',
        'BMJ Journals': 'BMJ Journals',
        'Cambridge University Press': 'Cambridge University Press',
        ChemRxiv: 'ChemRxiv',
        CiteCeerX: 'CiteSeerX',
        'Clinical Trials Transformation Initiative':
          'Clinical Trials Transformation Initiative',
        'DBLP Computer Science Bibliography':
          'DBLP Computer Science Bibliography',
        'De Gruyter academic publishing': 'De Gruyter academic publishing',
        Frontiers: 'Frontiers',
        'HAL Open Sience': 'HAL Open Science',
        HighWire: 'HighWire',
        IEEE: 'IEEE',
        'IOP Publishing': 'IOP Publishing',
        Karger: 'Karger',
        medRxiv: 'medRxiv',
        Microsoft: 'Microsoft',
        'Papers With Code': 'Papers With Code',
        'Project Muse': 'Project Muse',
        PubMed: 'PubMed',
        'Research Square': 'Research Square',
        'Sage Publishing': 'Sage Publishing',
        Science: 'Science',
        'Scientific.Net': 'Scientific.Net',
        'Scitepress Digital Library': 'Scitepress Digital Library',
        'Springer Nature': 'Springer Nature',
        'SPIE.': 'SPIE.',
        SSRN: 'SSRN',
        'Taylor and Francis Group': 'Taylor and Francis Group',
        'The MIT Press': 'The MIT Press',
        'The Royal Society Publishing': 'The Royal Society Publishing',
        'University of Chicago Press': 'University of Chicago Press',
        Wiley: 'Wiley',
        'Wolters Kluwer': 'Wolters Kluwer',
      },
      coar: {
        authToken: "Jeton d'authentification COAR Notify",
        refreshAuthToken: "Actualiser le jeton d'authentification",
        copyMessage:
          "Le jeton d'authentification n'est affiché qu'une seule fois !",
        copyDescription:
          "Veuillez copier le jeton d'authentification maintenant et le stocker dans votre système COAR Notify tiers. Vous pouvez toujours actualiser le jeton ici, mais les jetons précédents seront invalidés.",
      },
      warnings: {
        'form-integrationsAndPublishing_integrations_coarNotify_repoIpAddress':
          "La liste des adresses IP est obsolète et sera bientôt supprimée. Veuillez utiliser l'option « Jeton d'authentification COAR Notify » ci-dessous pour vous authentifier.",
      },
    },
    notificationPage: {
      title: 'Événements de Notification',
      messages: {
        events: 'Événements',
        noEvents: 'Aucun événement de notification trouvé',
        noSelectedEvent:
          'Sélectionnez un notification à afficher ou créez-en un nouveau',
      },
      eventSettings: {
        title: "Paramètres de l'Événement",
        displayName: "Nom d'Affichage",
        event: 'Événement',
        type: 'Type',
        delay: 'Envoyer après',
        emailTemplate: "Modèle d'Email",
        newNotification: 'Nouvelle Notification',
      },
      emailSettings: {
        title: "Paramètres de l'Email",
        recipient: 'à',
        ccEmails: 'cc',
        subject: 'Objet',
      },
      filters: {
        all: 'Tous',
        active: 'Actif',
        inactive: 'Inactif',
        delayed: 'Retardé',
        activeEvents: 'Événements actifs',
        inactiveEvents: 'Événements inactifs',
      },
      eventDescriptions: {
        // #region Manuscript
        'manuscript-submit': 'Confirmation de la soumission du manuscrit',
        'manuscript-new-version': 'Nouvelle version du manuscrit soumise',
        'manuscript-import':
          'Nouveaux manuscrits, articles ou prépublications importés dans Kotahi',
        'manuscript-publish': 'Publier',
        // #endregion Manuscript
        // #region Review
        'review-invitation': 'Invitation du réviseur',
        'review-invitation-follow-up':
          "Le réviseur a été invité, mais n'a pas accepté l'invitation à réviser",
        'review-accepted': "Réviseur accepté, mais n'a pas soumis de révision",
        'review-rejected':
          'Le réviseur rejette une invitation à participer à une révision',
        'review-completed': 'Révision soumise',
        // #endregion Review
        // #region Collaborative Review
        'collaborative-review-invitation':
          'Invitation du réviseur collaboratif',
        'collaborative-review-invitation-follow-up':
          "Le réviseur collaboratif a été invité, mais n'a pas accepté l'invitation à réviser",
        'collaborative-review-accepted':
          'Le réviseur collaboratif accepte une invitation à participer à une révision',
        'collaborative-review-rejected':
          'Le réviseur collaboratif rejette une invitation à participer à une révision',
        'collaborative-review-lock':
          'La révision collaborative a été verrouillée',
        'collaborative-review-unlock':
          'La révision collaborative a été déverrouillée',
        // #endregion Collaborative Review
        // #region Author Invitation
        'author-invitation':
          'Auteur invité à participer à une révision par les pairs',
        'author-accepted':
          "L'auteur accepte une invitation à participer à une révision par les pairs",
        'author-rejected':
          "L'auteur rejette une invitation à participer à une révision par les pairs",
        'author-invitation-follow-up':
          "Auteur invité mais n'a pas accepté l'invitation à réviser",
        // #endregion Author Invitation
        // #region Chat
        'chat-unread': 'Message de discussion non lu',
        'chat-mention':
          'Notification immédiate pour les utilisateurs mentionnés dans un message',
        // #endregion Chat
        // #region Author Proofing
        'author-proofing-assign': "Invitation à la correction de l'auteur",
        'author-proofing-submit-feedback':
          "Correction de l'auteur terminée et commentaires soumis",
        // #endregion Author Proofing
        // #region Team assignment
        'team-editor-assigned': 'Éditeur assigné',
        'team-editor-unassigned': 'Éditeur non assigné',
        // #endregion Team assignment
        // #region User
        'user-first-login': 'Nouvelle connexion utilisateur',
        'user-set-group-role': 'Rôle utilisateur assigné',
        'user-delete': 'Compte utilisateur supprimé',
        // #endregion User
        // #region Decision form
        'decision-form-make-decision':
          "L'éditeur soumet un formulaire de décision",
        'decision-form-make-decision-with-verdict':
          'Acceptation, révision ou rejet du verdict',
        'decision-form-complete-comment':
          'Nouveau message de champ de formulaire de discussion',
        // #endregion Decision form
      },
    },
    reportsPage: {
      Reports: 'Rapports',
      Show: 'Afficher',
      activityForManuscripts: 'activité pour les manuscrits arrivant',
      activityForManuscriptsTooltip: `Les métriques sont montrées pour les manuscrits qui ont été ajoutés en premier
                    <br />
                    entre ces dates. Les limites de date sont
                    <br />
                    à minuit en temps universel.`,
      'Editors workflow': 'Flux de travail des éditeurs',
      'All manuscripts': 'Tous les manuscrits',
      Submitted: 'Soumis',
      'Editor assigned': 'Éditeur assigné',
      'Decision complete': 'Décision finale',
      Accepted: 'Accepté',
      Published: 'Publié',
      'Reviewers workflow': 'Flux de travail des évaluateurs',
      'Reviewer invited': 'Évaluateur invité',
      'Invite accepted': 'Invitation acceptée',
      'Review completed': 'Évaluation terminée',
      'Manuscripts published today': "Manuscrits publiés aujourd'hui",
      'From midnight local time': 'À partir de minuit, heure locale',
      Average: 'Moyenne',
      'Manuscripts in progress': 'Manuscrits en cours',
      'Based on the selected date range':
        'Basé sur la plage de dates sélectionnée',
      reviwingAndEditing:
        "Durées de révision et d'édition pour les manuscrits individuels",
      'Days spent on': 'Jours passés sur',
      daysSpentReview: 'révision,',
      daysSpentPostreview: 'post-révision',
      'or incomplete': '(ou incomplet)',
      'Submission date': 'Date de soumission',
      summaryInfo: {
        'Average time to publish': 'Temps moyen pour publier',
        roundedDays: '{{days}} jour',
        roundedDays_plural: '{{days}} jours',
        'From submission to published': 'De la soumission à la publication',
        'Average time to review': "Temps moyen pour l'examen",
        awaitingRevision: 'En attente de révision',
        unassigned: 'Non assigné',
        reviewed: 'Évalué',
      },
      reportTypes: {
        Summmary: 'Résumé',
        Manuscript: 'Manuscrit',
        Editor: 'Éditeur',
        Reviewer: 'Évaluateur',
        Author: 'Auteur',
      },
      tables: {
        manuscripts: {
          'Manuscript number': 'Numéro du manuscrit',
          'Entry date': "Date d'entrée",
          Title: 'Titre',
          Author: 'Auteur',
          Editors: 'Éditeurs',
          Reviewers: 'Évaluateurs',
          Status: 'Statut',
          'Published date': 'Date de publication',
          reviewDuration: 'La revue a pris <strong>{{durations}}</strong> jour',
          reviewDuration_other:
            'La revue a pris <strong>{{durations}}</strong> jours',
          prevReviewDuration:
            'La revue précédente a pris <strong>{{durations}}</strong> jour',
          prevReviewDuration_other:
            'La revue précédente a pris <strong>{{durations}}</strong> jours',
          reviewDurations:
            'Les revues ont pris <strong>{{durations}}</strong> jours',
          prevReviewDurations:
            'Les revues précédentes ont pris <strong>{{durations}}</strong> jours',
        },
        editor: {
          'Editor name': "Nom de l'éditeur",
          'Manuscripts assigned': 'Manuscrits assignés',
          'Assigned for review': 'Assigné pour évaluation',
          Revised: 'Révisé',
          Rejected: 'Rejeté',
          Accepted: 'Accepté',
          Published: 'Publié',
        },
        reviewer: {
          'Reviewer name': "Nom de l'évaluateur",
          'Review invites': 'Invitations à évaluer',
          'Invites declined': 'Invitations déclinées',
          'Reviews completed': 'Évaluations terminées',
          'Average review duration': "Durée moyenne de l'évaluation",
          'Recommended to accept': 'Recommandé pour acceptation',
          'Recommended to revise': 'Recommandé pour révision',
          'Recommended to reject': 'Recommandé pour rejet',
          days: '{{days}} jour',
          days_plural: '{{days}} jours',
        },
        author: {
          'Author name': "Nom de l'auteur",
          revisionRequested: 'Révision demandée',
        },
      },
    },
    emailTemplate: {
      pageTitle: 'Modèles de notification',
      'Email Templates': "Modèles d'email",
      'New Email Template': "Nouveau modèle d'email",
      subject: 'Sujet',
      cc: 'CC',
      ccEditorsCheckboxDescription:
        "Ajouter automatiquement les éditeurs de manuscrit en « CC » lors de l'envoi de cet e-mail (si applicable)",
      body: 'Corps',
      description: 'Description',
      addANewEmailTemplate: "Ajouter un nouveau modèle d'email",
      'Edited on': 'Modifié le {{date}}',
      delete: 'Supprimer',
      permanentlyDelete:
        "La suppression de ce modèle d'email entraînera également la suppression de son affectation aux tâches et aux paramètres de configuration. Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ?",
      validationMessages: {
        invalidEmail: "L'adresse email est invalide",
        duplicateDescription: 'Un modèle avec la même description existe déjà.',
      },
    },
    loginPage: {
      kotahiUses:
        'Kotahi utilise ORCID <0>icône</0> pour identifier les auteurs et le personnel.',
      'Login with ORCID': 'Se connecter avec ORCID',
      'Register with ORCID': "S'inscrire avec ORCID",
    },
    frontPage: {
      recent: 'Publications récentes dans {{brandName}}',
      Dashboard: 'Tableau de bord',
      Login: 'Connexion',
    },
    declineReviewPage: {
      youHaveDeclined:
        'Vous avez décliné une invitation à participer à une évaluation par les pairs.',
      reason:
        'Veuillez partager vos raisons de refuser cette invitation ci-dessous.',
      messageHere: 'Votre message ici...',
      dontWantContact: 'Je ne souhaite pas être recontacté',
      'Submit Feedback': 'Envoyer les commentaires',
      'Decline Invitation': "Refuser l'invitation",
      thanks: "Merci d'avoir soumis vos commentaires.",
      suggestedReviewers: 'Réviseurs suggérés',
      invalidReviewers: 'Certains évaluateurs ne sont pas valides',
    },
    invitationAcceptedPage: {
      acceptError: "Cette invitation n'a pas pu être acceptée",
      declineError: "Cette invitation n'a pas pu être refusée",
      assignAuthorFailed: "Échec de l'attribution de l'auteur",
      assignReviewerFailed: "Échec de l'attribution du réviseur",
      invalidUser:
        'Cette invitation ne correspond pas à votre utilisateur actuel',
      invitedAlreadyRejected: 'Cette invitation a déjà été rejetée',
      invitedAlreadyAccepted: 'Cette invitation a déjà été acceptée',
      invalidInviteId:
        "L'invitation n'est pas valide. Veuillez vérifier le lien et réessayer plus tard.",
      returnToDashboard: 'Retour au Tableau de Bord',
    },
    reviewPreviewPage: {
      Summary: 'Résumé',
      Back: 'Retour',
    },
    sharedReviews: {
      'Other Reviews': 'Autres avis',
    },
    linkExpiredPage:
      "Ce lien d'invitation a expiré. Veuillez contacter l'administrateur système pour envoyer une nouvelle invitation.",
    waxEditor: {
      'Front matter tools': 'Outils de la section préliminaire',
      'Back matter tools': 'Outils de la section finale',
      'Front matter': 'Section préliminaire',
      'Change to front matter': 'Modifier la section préliminaire',
      'Funding Group': 'Groupe de financement',
      'Funding source': 'Source de financement',
      'Change to funding source': 'Modifier la source de financement',
      'Award ID': 'Identifiant de la subvention',
      'Change to award ID': "Modifier l'identifiant de la subvention",
      'Funding statement': 'Déclaration de financement',
      'Change to funding statement': 'Modifier la déclaration de financement',
      Keywords: 'Mots-clés',
      Keyword: 'Mot-clé',
      'Change to keyword': 'Modifier le mot-clé',
      'Keyword list': 'Liste de mots-clés',
      'Change to keyword list': 'Modifier la liste de mots-clés',
      Abstract: 'Résumé',
      'Change to abstract': 'Modifier le résumé',
      Appendices: 'Annexes',
      Appendix: 'Annexe',
      'Change to appendix': "Modifier l'annexe",
      Acknowledgements: 'Remerciements',
      'Change to acknowledgements': 'Modifier les remerciements',
      Glossary: 'Glossaire',
      'Glossary section': 'Section du glossaire',
      'Change to glossary section': 'Modifier la section du glossaire',
      'Glossary term': 'Terme du glossaire',
      'Change to glossary term': 'Modifier le terme du glossaire',
      'Glossary item': 'Élément du glossaire',
      'Change to glossary item': "Modifier l'élément du glossaire",
      Citations: 'Citations',
      'Reference list': 'Liste de références',
      'Change to reference list': 'Modifier la liste de références',
      Reference: 'Référence',
      'Change to reference': 'Modifier la référence',
    },
    manuscriptSubmit: {
      'Current version': 'Version actuelle',
      'Edit submission info': 'Modifier les informations de soumission',
      'Manuscript text': 'Texte du manuscrit',
      'Submit your research object': 'Soumettre votre objet de recherche',
      'Errors in your submission': 'Erreurs dans votre soumission',
      errorsList:
        'Il y a des erreurs dans votre soumission, veuillez corriger ce qui suit :',
      Submit: 'Soumettre',
      or: 'ou',
      'get back to your submission': 'revenir à votre soumission',
      'Submit a new version': 'Soumettre une nouvelle version',
      submitVersionButton: 'Soumettre une nouvelle version...',
      canModify:
        'Vous pouvez modifier et resoumettre une nouvelle version de votre manuscrit.',
      askedToRevise:
        'Il vous a été demandé de <strong>réviser</strong> votre manuscrit ; consultez les évaluations et la décision ci-dessous. Vous pouvez modifier et resoumettre une nouvelle version de votre manuscrit.',
      'Submitted info': 'Informations soumises',
      Reviews: 'Avis',
      'No reviews to show': 'Aucun avis à afficher.',
      'No completed reviews': 'Aucun avis terminé.',
      Metadata: 'Métadonnées',
    },
    chat: {
      'Your message here...': 'Votre message ici...',
      Send: 'Envoyer',
      noDiscussion:
        'Aucune discussion pour ce manuscrit pour le moment. Commencez par taper un message ci-dessous.',
      'Unread messages': 'Messages non lus',
      'Admin discussion': "Discussion d'administration",
      'Group Manager discussion': 'Discussion du gestionnaire de groupe',
      'Show admin discussion': "Afficher la discussion d'administration",
      'Show group manager discussion':
        'Afficher la discussion du gestionnaire de groupe',
      'Hide Chat': 'Masquer le chat',
      'Discussion with author': "Discussion avec l'auteur",
      'Discussion with editorial team': "Discussion avec l'équipe éditoriale",
      'Editorial discussion': 'Discussion éditoriale',
      'Show Chat': 'Afficher le chat',
      edit: 'Modifier',
      delete: 'Supprimer',
      Edited: 'Modifié',
      'Open video chat': 'Ouvrir le chat vidéo',
      Formatting: 'Mise en forme',
      'Hide formatting': 'Masquer la mise en forme',
    },
    taskManager: {
      list: {
        'Add your first task...': 'Ajoutez votre première tâche...',
        'Add a new task': 'Ajouter une nouvelle tâche',
        Title: 'Titre',
        Assignee: 'Attributaire',
        'Duration in days': 'Durée en jours',
        'Duration/Due Date': "Durée/Date d'échéance",
        'Unregistered User': 'Utilisateur non enregistré',
        'User Roles': 'Rôles des utilisateurs',
        'Registered Users': 'Utilisateurs enregistrés',
        userRoles: {
          Reviewer: 'Évaluateur',
          'Collaborative reviewer': 'Colaborative evaluateur',
          Editor: 'Éditeur',
          Author: 'Auteur',
        },
      },
      task: {
        durationDaysNone: 'Aucun',
        selectAssignee: 'Sélectionner...',
        'Give your task a name': 'Donnez un nom à votre tâche...',
        Edit: 'Modifier',
        Delete: 'Supprimer',
        'Click to mark as done': 'Cliquez pour marquer comme terminé',
        statuses: {
          Paused: 'En pause',
          Pause: 'Pause',
          'In progress': 'En cours',
          Continue: 'Continuer',
          Done: 'Terminé',
          Start: 'Commencer',
        },
        unregisteredUser: {
          Email: 'Email',
          Name: 'Nom',
        },
      },
    },
    tasksPage: {
      'Task Template Builder': 'Créateur de modèle de tâche',
    },
    usersTable: {
      Users: 'Utilisateurs',
      Name: 'Nom',
      Created: 'Créé',
      'Last Online': 'Dernière connexion',
      Roles: 'Rôles',
      Delete: 'Supprimer',
      Yes: 'Oui',
      Cancel: 'Annuler',
      None: 'Aucun',
    },
    modals: {
      inviteDeclined: {
        'Invitation Decline': "Refus de l'invitation de {{name}}",
        Declined: 'Refusé : {{dateString}}',
        Reviewer: 'Évaluateur :',
        Status: 'Statut',
        declinedBadge: 'Refusé',
        'Opted Out': 'Opté pour sortir',
        'Declined Reason': 'Raison du refus',
        'No reason provided': 'Aucune raison fournie.',
      },
      reviewReport: {
        reviewReport: "Rapport d'évaluation de {{name}}",
        authorReport: "Rapport de l'auteur de {{name}}",
        collaborativeReview: 'Révision collaborative de {{name}}',
        anonymousReviewReport: "Rapport d'évaluation",
        'Last Updated': 'Dernière mise à jour : {{dateString}}',
        Reviewer: 'Évaluateur :',
        email: 'E-mail :',
        Author: 'Auteur:',
        Status: 'Statut',
        reviewNotCompleted: "L'évaluation n'a pas encore été terminée",
        Delete: 'Supprimer',
        Shared: 'Partagé',
        Recommendation: 'Recommandation',
        'Hide Review': "Masquer l'évaluation",
        'Hide Reviewer Name': "Masquer le nom de l'évaluateur",
      },
      inviteReviewer: {
        'Invite Reviewer': 'Inviter un évaluateur',
        Shared: 'Partagé',
        'Email Notification': 'Notification par email',
        Collaborate: 'Collaborer',
        Cancel: 'Annuler',
        Invite: 'Inviter',
        SharedDesc:
          "Partager les avis avec d'autres évaluateurs une fois terminés",
        'Email Notification Description': 'Envoyer une invitation par e-mail',
        'Collaborate Description':
          'Faire de cet évaluateur un évaluateur collaboratif',
      },
      deleteReviewer: {
        deleteThisReviewer: 'Supprimer cet évaluateur ?',
        deleteThisAuthor: 'Supprimer cet auteur ?',
        Reviewer: 'Évaluateur :',
        Ok: 'Ok',
        Cancel: 'Annuler',
      },
      taskDelete: {
        permanentlyDelete: 'Supprimer définitivement cette tâche ?',
        Ok: 'Ok',
        Cancel: 'Annuler',
      },
      taskEdit: {
        'Task details': 'Détails de la tâche',
        'Task title': 'Titre de la tâche',
        'Task description': 'Description de la tâche',
        'Give your task a name': 'Donnez un nom à votre tâche...',
        Assignee: 'Attributaire',
        'Due date': "Date d'échéance",
        'Duration in days': 'Durée en jours',
        'Add Notification Recipient': 'Ajouter un destinataire de notification',
        Recipient: 'Destinataire',
        'Select a recipient': 'Sélectionner un destinataire',
        'Select email template': "Sélectionner un modèle d'email",
        'Send notification': 'Envoyer une notification',
        Send: 'Envoyer',
        days: 'jours',
        before: 'avant',
        after: 'après',
        'due date': "date d'échéance",
        'Send Now': 'Envoyer maintenant',
        'Show all notifications sent':
          'Afficher toutes les notifications envoyées ({{count}})',
        'Hide all notifications sent':
          'Masquer toutes les notifications envoyées ({{count}})',
      },
      deleteField: {
        'Permanently delete this field': 'Supprimer définitivement ce champ ?',
      },
      deleteForm: {
        'Permanently delete this form':
          'Supprimer définitivement ce formulaire ?',
      },
      assignUserRole: {
        text: "Souhaitez-vous attribuer le rôle de <strong>{{role}}</strong> à l'utilisateur {{user}} ?",
      },
      removeUserRole: {
        text: "Souhaitez-vous retirer le rôle de <strong>{{role}}</strong> à l'utilisateur {{user}} ?",
      },
      deleteUser: {
        'Permanently delete user':
          "Supprimer définitivement l'utilisateur {{userName}} ?",
        Delete: 'Supprimer',
        Cancel: 'Annuler',
      },
      cmsPageDelete: {
        Cancel: 'Annuler',
        Delete: 'Supprimer',
        permanentlyDelete: 'Supprimer définitivement la page {{pageName}} ?',
      },
      deleteMessage: {
        'Are you sure you want to delete this message?':
          'Êtes-vous sûr de vouloir supprimer ce message ?',
      },
      editMessage: {
        'Edit message': 'Éditer le message',
        cancel: 'Annuler',
      },
      publishError: {
        'Some targets failed to publish':
          'Échec de la publication de certaines cibles.',
        'Publishing error': 'Erreur de publication',
      },
      deleteFile: {
        'Are you sure you want to delete this file?':
          'Êtes-vous sûr de vouloir supprimer ce fichier ?',
      },
      metadata: {
        deleteCollection:
          'Êtes-vous sûr de vouloir supprimer cette collection ?',
      },
      editDiscussion: {
        saveEdit: 'Enregistrer la modification',
        cancel: 'Annuler',
      },
    },

    newSubmission: {
      'New submission': 'Nouvelle soumission',
      'Submission created': 'Soumission créée',
      'Upload Manuscript': 'Télécharger le manuscrit',
      dragNDrop: 'Glisser-déposer ou cliquer pour sélectionner un fichier',
      acceptedFiletypes:
        'Types de fichiers acceptés : pdf, epub, zip, docx, latex',
      converting:
        "Votre manuscrit est en train d'être converti en une version directement éditable. Cela peut prendre quelques secondes.",
      'Submit a URL instead': 'Soumettre une URL à la place',
      errorUploading: '{{error}}',
    },
    formBuilder: {
      'New Form': 'Nouveau formulaire',
      'Create Form': 'Créer un formulaire',
      'Update Form': 'Mettre à jour le formulaire',
      'Add new form': 'Ajouter un nouveau formulaire',
      'Form purpose identifier': 'Identifiant du but du formulaire',
      'Form Name': 'Nom du formulaire',
      'Form title': 'Titre du formulaire',
      Description: 'Description',
      submitConfirmPage:
        'Afficher une page de confirmation lors de la soumission ?',
      submitComment: 'Soumettre un commentaire',
      submittedAt: 'Soumis à',
      updatedAt: 'mis à jour à',
      publishedAt: 'Publié à',
      'Popup Title': 'Titre de la popup',
      'Field Properties': 'Propriétés du champ',
      'Field type': 'Type de champ',
      'Field title': 'Titre du champ',
      'Field name': 'Nom (nom de champ interne)',
      'Field placeholder': 'Espace réservé du champ',
      internalNameDescription:
        'Entrez "submission." suivi d\'un nom contenant uniquement des lettres, des chiffres ou des traits de soulignement, par exemple "submission.votreNomDeChampIci".',
      'Field description': 'Description du champ',
      'Field options': 'Options du champ',
      'Field shortDescription':
        'Titre court (facultatif — utilisé dans les listes concises)',
      'Field validate': 'Options de validation',
      'Field hideFromReviewers': 'Masquer des évaluateurs ?',
      'Field hideFromAuthors': 'Masquer des auteurs ?',
      'Field permitPublishing':
        'Inclure lors du partage ou de la publication ?',
      'Field publishingTag': 'Tag Hypothesis',
      'FieldDescription publishingTag':
        "Vous pouvez spécifier une étiquette à utiliser lors du partage de ce champ en tant qu'annotation Hypothesis.",
      'Label to display': 'Étiquette à afficher',
      'Default Value': 'Valeur par défaut',
      'Color label': 'Étiquette de couleur',
      'Enter label': 'Entrer une étiquette...',
      'Internal name': 'Nom interne',
      'Enter name': 'Entrer un nom...',
      'Add another option': 'Ajouter une autre option',
      'Add options from a JSON file':
        "Ajouter des options à partir d'un fichier JSON",
      dropDownDescription:
        "Téléchargez un fichier JSON contenant une liste de champs. Chaque champ doit être un objet avec comme 'clé' le internalName (un identifiant unique pour le champ) et comme valeur le label (le nom affiché).",
      'Delete this option': 'Supprimer cette option',
      validateInputPlaceholder: 'Sélectionner...',
      'Field parse': 'Analyse spéciale',
      'Field format': 'Formatage spécial',
      'Field doiValidation': 'Valider comme un DOI ?',
      'Field doiUniqueSuffixValidation':
        "Valider comme un suffixe DOI et s'assurer qu'il est unique ?",
      'Field allowFutureDatesOnly': 'Sélectionner une date future uniquement ?',
      'Update Field': 'Mettre à jour le champ',
      'Correct invalid values before updating':
        'Corriger les valeurs invalides avant la mise à jour',
      'Field inline': 'Champ en ligne',
      'Field sectioncss': 'CSS de la section du champ',
      'Field isReadOnly': 'Le champ est-il en lecture seule ?',
      'Field aiPrompt': 'Invite IA',
      'Field metadataMapping': 'Mappage des métadonnées',
      'Please give the form a name.': 'Veuillez donner un nom au formulaire.',
      'Give the form a title': 'Donnez un titre au formulaire',
      'Edit form settings': 'Modifier les paramètres du formulaire',
      'Add a field': 'Ajouter un champ...',
      'Make this the active form': 'Rendre ce formulaire actif',
      confirmMakeActiveForm: 'Rendre ce formulaire {{name}} actif ?',
      mustBePositiveInteger: 'Doit être un entier > 0',
      correctBeforeSaving: "Corrigez les valeurs invalides avant d'enregistrer",
      genericFields: 'Types de champ génériques',
      specialFields: 'Champs spéciaux',
      dataType: 'Type de données',
      nameInUse: 'Ce nom est déjà utilisé pour un autre champ',
      fallbackFieldLabel: 'Champ {{name}}',
      Active: 'Actif',
      unnamedForm: 'Formulaire sans nom',
      fieldOpts: {
        title: 'Titre',
        authors: 'Auteurs',
        abstract: 'Résumé',
        visualAbstract: 'Pièce jointe : Image unique',
        attachments: 'Pièces jointes',
        s3Uploader: 'Téléchargeur S3',
        coarEndorsement: "Déclaration d'appui",
        coarLinkedResource: 'Ressource liée',
        doi: 'DOI',
        dois: 'Plusieurs DOI',
        doiSuffix: 'Suffixe DOI"',
        divider: 'Séparateur',
        sourceUri: 'URI de la source du manuscrit',
        customStatus: 'Statut personnalisé',
        editDate: 'Date de dernière modification (lecture seule)',
        attachedManuscript: 'Manuscrit joint (lecture seule)',
        text: 'Texte',
        richText: 'Texte enrichi',
        select: 'Sélection dans liste déroulante',
        radioGroup: 'Boutons radio',
        checkboxes: 'Cases à cocher',
        contributors: 'Liste des contributeurs',
        links: 'Liste de liens (URL)',
        verdict: 'Verdict',
        discussion: 'Discussion',
        issueNumber: 'Numéro de délivrer',
        volumeNumber: 'Numéro de volume',
        issueYear: 'Année de parution',
        fullWax: 'Document',
        datePicker: 'Sélecteur de dates',
        embargoDate: "Date d'embargo",
      },
      typeOptions: {
        Select: 'Sélection',
        ManuscriptFile: 'Fichier du manuscrit',
        SupplementaryFiles: 'Pièces jointes',
        VisualAbstract: 'Pièce jointe image unique',
        AuthorsInput: 'Liste des contributeurs',
        DoisInput: 'Liste des DOI',
        LinksInput: 'Liste de liens (URIs)',
        AbstractEditor: 'Texte enrichi',
        TextField: 'Texte',
        CheckboxGroup: 'Cases à cocher',
        RadioGroup: 'Boutons radio',
        undefined: '',
        ThreadedDiscussion: 'Discussion',
      },
      submission: {
        title: 'Créateur de formulaire de soumission',
      },
      review: {
        title: 'Créateur de formulaire de revue',
      },
      decision: {
        title: 'Créateur de formulaire de décision',
      },
      errorIncompleteOption:
        'Remplissez à la fois le libellé et le nom interne',
    },
    fields: {
      uploadAttachmentSource: {
        title: 'Sélectionner le service S3',
        description:
          "Sélectionnez 'Externe' pour télécharger des pièces jointes vers un fournisseur de bucket tiers.",
        internal: 'Interne',
        external: 'Externe',
        s3Url: 'URL du service S3',
        s3Bucket: 'Bucket du service S3',
        s3Region: 'Région S3',
        s3AccessId: "ID d'accès S3",
        s3AccessToken: "Jeton d'accès S3",
        updateCredentials: "Mettre à jour les informations d'identification",
        setCredentials: "Définir les informations d'identification",
      },
      hideFromReviewers: {
        true: 'Oui',
        false: 'Non',
      },
      hideFromAuthors: {
        true: 'Oui',
        false: 'Non',
      },
      permitPublishing: {
        false: 'Jamais',
        true: "Ad hoc (l'éditeur décide au moment du partage/de la publication)",
        always: 'Toujours',
      },
      isReadOnly: {
        true: 'Oui',
        false: 'Non',
      },
      validate: {
        required: 'Requis',
        minChars: 'Nombre minimal de caractères',
        maxChars: 'Nombre maximal de caractères',
        minSize: "Nombre minimal d'éléments",
        labels: {
          minChars: 'Valeur du nombre minimal de caractères',
          maxChars: 'Valeur du nombre maximal de caractères',
          minSize: "Valeur du nombre minimal d'éléments",
        },
      },
      parse: {
        false: 'Aucun',
        split: 'Diviser aux virgules',
      },
      format: {
        false: 'Aucun',
        join: 'Joindre avec des virgules',
      },
      doiValidation: {
        true: 'Oui',
        false: 'Non',
      },
      doiUniqueSuffixValidation: {
        true: 'Oui',
        false: 'Non',
      },
      inline: {
        true: 'Oui',
        false: 'Non',
      },
      allowFutureDatesOnly: {
        true: 'Oui',
        false: 'Non',
      },
      embargo: {
        true: 'Oui',
        false: 'Non',
      },
      metadataMapping: {
        description:
          'Mapper automatiquement ce champ à une valeur importée depuis une source tierce',
        title: 'Mappage des métadonnées',
      },
    },
  },
}

export default fr
