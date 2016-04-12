from operator import itemgetter

def add_plays_to_counts_dict(counts_dict, plays):
    """Helper function to add a list of Play objects to a dictionary of Play
    frequency counts where the key is the play object and the value is the
    number of occurances."""

    for play in plays:
        if play in counts_dict:
            counts_dict[play] += 1
        else:
            counts_dict[play] = 1

class PlayerAnalytics:
    """Helper class to calculate analytics metrics for a group of players.

    Attributes:
        players: The list of the players we are calculating analytics for.
        total_time: An integer count of the total time, in seconds, that the
            players have spent doing tests.
        correct_plays: A sorted list of (<Play obj>, count) tuples, with count
            representing the number of times a question about that play was
            answered correctly.
        incorrect_plays: A sorted list of (<Play obj>, count) tuples, for plays
            that were answered incorrectly.
        skipped_plays: A sorted list of (<Play obj>, count) tuples, for plays
            that were skipped.
    """

    def __init__(self, players):
        """Inits with a list of Player objects."""
        self.players = players
        self.plays = dict()
        self.total_time = 0.0
        correct_plays_dict = {}
        incorrect_plays_dict = {}
        skipped_plays_dict = {}

        # Sum calculations across every TestResult for every Player in players
        for player in players:
            for result in player.testresult_set.all():
                if result.time_taken: self.total_time += result.time_taken

                add_plays_to_counts_dict(
                    plays=result.correct_plays.all(),
                    counts_dict=correct_plays_dict
                )
                add_plays_to_counts_dict(
                    plays=result.missed_plays.all(),
                    counts_dict=incorrect_plays_dict
                )
                add_plays_to_counts_dict(
                    plays=result.skipped_plays.all(),
                    counts_dict=skipped_plays_dict,
                )

        # Convert play count dictionaries into list of sorted tuples:
        # {<Play 1>: 4, <Play 2>: 10} --> [(<Play 2>, 10), (<Play 1>, 4)]
        self.correct_plays = sorted(correct_plays_dict.iteritems(),
            key=itemgetter(1), reverse=True)
        self.incorrect_plays = sorted(incorrect_plays_dict.iteritems(),
            key=itemgetter(1), reverse=True)
        self.skipped_plays = sorted(skipped_plays_dict.iteritems(),
            key=itemgetter(1), reverse=True)

    @classmethod
    def for_single_player(cls, player):
        return cls([player])

    @classmethod
    def for_players(cls, player_iterable):
        return cls(player_iterable)

    #####
    # Metric getters
    #####

    def avg_time_per_question(self):
        """Returns the average time spent per question over all of the test
        results of the player group."""
        total_questions = self.total_questions()
        return self.total_time / total_questions if total_questions > 0 else 0



    def total_correct(self):
        total = 0
        for play, count in self.correct_plays:
            total += count
        return total

    def total_incorrect(self):
        total = 0
        for play, count in self.incorrect_plays:
            total += count
        return total

    def total_skipped(self):
        total = 0
        for play, count in self.skipped_plays:
            total += count
        return total

    def total_questions(self):
        """Returns the total # of questions the players have been asked."""
        return self.total_correct() + self.total_incorrect() + \
            self.total_skipped()

    def total_correct_percentage(self):
        return int(100.0 * self.total_correct() / self.total_questions())

    def total_incorrect_percentage(self):
        return int(100.0 * self.total_incorrect() / self.total_questions())

    def total_skipped_percentage(self):
        return int(100.0 * self.total_skipped() / self.total_questions())

    def get_correct_percentage(self, play):
        correct = 0
        incorrect = 0
        skipped = 0
        for p, count in self.correct_plays:
            if p == play:
                correct += count
        for p, count in self.incorrect_plays:
            if p == play:
                incorrect += count
        for p, count in self.skipped_plays:
            if p == play:
                skipped += count
        return int(correct * 100.0 / (correct + incorrect + skipped))

    def get_incorrect_percentage(self, play):
        correct = 0
        incorrect = 0
        skipped = 0
        for p, count in self.correct_plays:
            if p == play:
                correct += count
        for p, count in self.incorrect_plays:
            if p == play:
                incorrect += count
        for p, count in self.skipped_plays:
            if p == play:
                skipped += count
        return int(incorrect * 100.0 / (correct + incorrect + skipped))

    def get_skipped_percentage(self, play):
        correct = 0
        incorrect = 0
        skipped = 0
        for p, count in self.correct_plays:
            if p == play:
                correct += count
        for p, count in self.incorrect_plays:
            if p == play:
                incorrect += count
        for p, count in self.skipped_plays:
            if p == play:
                skipped += count
        return int(skipped * 100.0 / (correct + incorrect + skipped))
