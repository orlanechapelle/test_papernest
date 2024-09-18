/* If I had more time or as next steps, I would do the following checks:
- select an arrival date in a month 
- add a fake number to check error message
- check payment sucessfull and failed*/
  

describe('newspaper flow', () => {

  const url = 'https://app.papernest.com/onboarding?anonymous&anonymousId=test&id_text=1&destination=newspaper' 
  const arrivalDate = new Date()
  const oldHousingAddress = '12 Rue de Brest 69002 Lyon'
  const HousingAddress = '4 Rue Descartes 44000 Nantes'
  const email = 'test+'+arrivalDate.getTime()+'+@papernest.com'
  const phone = '612345678'
  const firstName = 'Orlane'
  const lastName = 'Chapelle'
  //const posteOffer = 
  // const confirmationCodeDestination = 


  it('newspaper flow', () => {
   
    cy.log('User visit newspaper page')
    cy.visit(url) 

    cy.log('user clicks on commencer')
    cy.get('#popin-poste-classic').contains('Commencer').click()

    cy.log('user select the arrival date')
    cy.get('[data-mat-calendar="mat-datepicker-0"]').click()
    //click on button to see next month, then come back to current month
    cy.get('.mat-calendar-next-button').click()
    cy.get('.mat-calendar-previous-button').click()
    cy.get('button[aria-label="' + arrivalDate.toLocaleDateString('fr-FR', {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) + '"]').click()  

    cy.log('user types in his old housing address')
    cy.get('[id="old_housing.address"]').click({force:true}).type(oldHousingAddress)
    cy.get('.dropdown > .ng-star-inserted > p').click()

    cy.log('user types in his new housing address')
    cy.get('[id="housing.address"]').click({force:true}).type(HousingAddress)
    cy.get('.dropdown > [style=""]').click()
    cy.get('#button_next').click()

    cy.log('user selects la poste offer')
    cy.get('#offer_poste_6').should('be.visible')
    cy.get('#offer_poste_12').should('be.visible').click()

    cy.log('user indicates his personal data')
    cy.intercept({
      method: 'POST',
      url: '/api/utils/email/',
      times: 1
    }).as('email')
    cy.get('[id="user.email"]').click({force:true}).type(email)
    cy.wait('@email', { requestTimeout: 20000, responseTimeout: 20000 }).then(({ request, response }) => {
      expect(request?.body.email).to.eq(email)
      expect(response?.statusCode).to.eq(200)
      expect(response?.body.response).to.eq(false)
    })
    cy.get('[id="user.phone_number"]').click({force:true}).type(phone)
    cy.get('[id="user.civility-mister"]').should('be.visible')
    cy.get('[id="user.civility-madam"]').should('be.visible').click({force:true})
    cy.get('[id="user.first_name"]').click({force:true}).type(firstName)
    cy.get('[id="user.last_name"]').click({force:true}).type(lastName)
    cy.log('user can add his family member personal data')
    //check that the checkbox is visible and click on it
    cy.get('.validation__checkbox').should('be.visible').click()
    cy.get('.validation__checkbox').eq(1).should('be.visible')
    cy.get('.validation__checkbox').eq(0).click({force:true})
    cy.get('#button_next').type('{enter}')

    cy.log('user select how to receive confirmation code')
    cy.get('[id="poste-subscription.confirmation_code_destination-home"]').should('be.visible')
    cy.get('[id="poste-subscription.confirmation_code_destination-post_office"]').should('be.visible').click()
    cy.get('#button_next').type('{enter}')
    cy.wait(1000)

    cy.log('user checks summary')
    // wanted to check the date but couldn't get the first letter of the weekday to be uppercase
    /*cy.get('[id="{poste-subscription.begin_date|dateTimeFormat:fr:dddd D MMMM YYYY}"]').contains( arrivalDate.toLocaleDateString('fr-FR', {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday:"long",
    }).() )*/
    cy.get('[id="{poste-subscription.offer_name}"]').contains("LA POSTE Redirection contrat 12 mois")
    cy.get('[id="{old_housing.address}"]').contains(oldHousingAddress)
    cy.get('[id="{housing.address}"]').contains(HousingAddress)
    cy.get('[id="{user.civility} {user.first_name} {user.last_name}"]').contains("Mme "+firstName+" "+lastName)
    cy.get('[id="{user.email}"]').contains(email)
    cy.get('[id="{user.phone_number}"]').contains("+33"+phone)
    cy.get('[id="{poste-subscription.confirmation_code_destination}"]').contains('Dans un bureau de Poste')
    cy.get('#button_next_summary').type('{enter}')

    cy.log('user enter his payment information')
    cy.get('.stripe-container').should('be.visible')
  
  })
})


