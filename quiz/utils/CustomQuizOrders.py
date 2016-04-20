class QuizOrders:
    """Helper class. Allows you to call things like: QuizOptions.RECENT.url_key
    rather than having 'recent' strings in multiple files.

    Attributes:
        options: A list of all the quiz order options (used for select menus)
    """

    class RECENT:
        display_text = 'Recently added'
        url_key = 'recent'

    class WORST:
        display_text = 'My worst performers'
        url_key = 'worst'

    # When adding new quiz orders, be sure to add them to this list
    options = [
        RECENT, 
        WORST,
    ]
